/**
 * Academic Year module — RC2 UAT stability suite
 *
 * Covers success and failure paths for:
 * Create, Edit (PUT semantics), Archive, Restore, Search,
 * duplicate validation (exclude self), active/current logic,
 * date persistence, and Audit Trail writes.
 *
 * Run: node tests/academicYear.api.test.js
 * Requires a live DATABASE_URL (uses service layer + Prisma).
 */

require("dotenv").config();

const academicYearService = require("../services/academicYear.service");
const academicYearRepository = require("../repositories/academicYear.repository");
const prisma = require("../database/db");

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function toDateInput(value) {
    return new Date(value).toISOString().slice(0, 10);
}

async function cleanupByPrefix(prefix) {
    await prisma.academicYear.deleteMany({
        where: { name: { startsWith: prefix } },
    });
}

async function findAudit({ entityType, recordId, action }) {
    return prisma.auditLog.findFirst({
        where: {
            entityType,
            recordId: Number(recordId),
            action: String(action).toUpperCase(),
        },
        orderBy: { createdAt: "desc" },
    });
}

async function run() {
    const prefix = `UAT-AY-${Date.now()}-`;
    const nameA = `${prefix}Alpha`;
    const nameB = `${prefix}Beta`;
    const nameUnique = `${prefix}Gamma`;
    const nameSearch = `${prefix}Searchable`;

    // Prefer seeded admin; fall back to any user for audit actor.
    const admin =
        (await prisma.user.findFirst({
            where: { deletedAt: null },
            orderBy: { id: "asc" },
        })) || null;
    const actor = admin
        ? { userId: admin.id, ipAddress: "127.0.0.1", userAgent: "uat-test" }
        : {};

    console.log("====================================");
    console.log("DIS-SMS Academic Year RC2 UAT Suite");
    console.log("====================================");

    try {
        await cleanupByPrefix(prefix);

        // ---------- CREATE ----------
        const yearA = await academicYearService.createAcademicYear(
            {
                name: nameA,
                startDate: "2030-01-01",
                endDate: "2030-12-31",
                status: "INACTIVE",
            },
            actor
        );
        assert(yearA?.id, "Create should return an academic year with id");
        assert(yearA.name === nameA, "Create should persist name");
        assert(
            toDateInput(yearA.startDate) === "2030-01-01",
            "Create should persist startDate"
        );
        assert(
            toDateInput(yearA.endDate) === "2030-12-31",
            "Create should persist endDate"
        );
        assert(yearA.isCurrent === false, "INACTIVE create must not be current");
        console.log("✓ Create academic year succeeds");

        // Duplicate create fails
        let duplicateCreateBlocked = false;
        try {
            await academicYearService.createAcademicYear({
                name: nameA,
                startDate: "2032-01-01",
                endDate: "2032-12-31",
                status: "INACTIVE",
            });
        } catch (error) {
            duplicateCreateBlocked =
                error?.statusCode === 409 &&
                /Academic year name must be unique/i.test(error.message);
        }
        assert(duplicateCreateBlocked, "Duplicate create must fail with 409");
        console.log("✓ Duplicate create is rejected");

        // Invalid date order fails
        let badDatesBlocked = false;
        try {
            await academicYearService.createAcademicYear({
                name: `${prefix}BadDates`,
                startDate: "2030-12-31",
                endDate: "2030-01-01",
                status: "INACTIVE",
            });
        } catch (error) {
            badDatesBlocked =
                error?.statusCode === 400 &&
                /Start date must be earlier than end date/i.test(error.message);
        }
        assert(badDatesBlocked, "Invalid date order must fail with 400");
        console.log("✓ Invalid date order is rejected");

        // ---------- ACTIVE / CURRENT ----------
        const activeYear = await academicYearService.createAcademicYear(
            {
                name: `${prefix}Active`,
                startDate: "2033-01-01",
                endDate: "2033-12-31",
                status: "ACTIVE",
            },
            actor
        );
        assert(activeYear.status === "ACTIVE", "ACTIVE create sets status");
        assert(activeYear.isCurrent === true, "ACTIVE create sets isCurrent");

        const secondActive = await academicYearService.createAcademicYear(
            {
                name: `${prefix}Active2`,
                startDate: "2034-01-01",
                endDate: "2034-12-31",
                status: "ACTIVE",
            },
            actor
        );
        assert(secondActive.isCurrent === true, "Newest ACTIVE is current");

        const demoted = await academicYearRepository.findAcademicYearById(
            activeYear.id
        );
        assert(
            demoted.status === "INACTIVE" && demoted.isCurrent === false,
            "Previous ACTIVE year must be demoted to INACTIVE"
        );
        console.log("✓ Active/current year logic demotes prior ACTIVE");

        // ---------- UPDATE (exclude self + date persist) ----------
        const yearB = await academicYearService.createAcademicYear(
            {
                name: nameB,
                startDate: "2031-01-01",
                endDate: "2031-12-31",
                status: "INACTIVE",
            },
            actor
        );

        const selfWithStringExclude =
            await academicYearRepository.findAcademicYearByName(nameA, {
                excludeId: String(yearA.id),
            });
        assert(
            selfWithStringExclude === null,
            "findAcademicYearByName must exclude current id when excludeId is a string"
        );

        // Edit without changing name (string id — UI row ids are strings)
        const unchanged = await academicYearService.updateAcademicYear(
            String(yearA.id),
            {
                name: nameA,
                startDate: toDateInput(yearA.startDate),
                endDate: toDateInput(yearA.endDate),
                status: "INACTIVE",
            },
            actor
        );
        assert(
            unchanged.name === nameA,
            "Editing without changing the name should succeed"
        );
        console.log("✓ Edit without name change succeeds (PUT path)");

        // Date changes persist
        const dated = await academicYearService.updateAcademicYear(
            yearA.id,
            {
                startDate: "2030-02-01",
                endDate: "2030-11-30",
            },
            actor
        );
        assert(
            toDateInput(dated.startDate) === "2030-02-01",
            "Updated startDate must persist"
        );
        assert(
            toDateInput(dated.endDate) === "2030-11-30",
            "Updated endDate must persist"
        );
        console.log("✓ Date changes persist correctly");

        // Rename to unique name
        const renamed = await academicYearService.updateAcademicYear(
            yearA.id,
            {
                name: nameUnique,
                startDate: "2030-02-01",
                endDate: "2030-11-30",
                status: "INACTIVE",
            },
            actor
        );
        assert(
            renamed.name === nameUnique,
            "Renaming to a unique name should succeed"
        );
        console.log("✓ Rename to unique name succeeds");

        // Rename to another existing name fails
        let duplicateUpdateBlocked = false;
        try {
            await academicYearService.updateAcademicYear(yearA.id, {
                name: nameB,
                startDate: "2030-02-01",
                endDate: "2030-11-30",
                status: "INACTIVE",
            });
        } catch (error) {
            duplicateUpdateBlocked =
                error?.statusCode === 409 &&
                /Academic year name must be unique/i.test(error.message);
        }
        assert(
            duplicateUpdateBlocked,
            "Renaming to another existing Academic Year should fail"
        );
        console.log("✓ Rename to existing name is rejected");

        // ---------- SEARCH ----------
        await academicYearService.createAcademicYear(
            {
                name: nameSearch,
                startDate: "2035-01-01",
                endDate: "2035-12-31",
                status: "INACTIVE",
            },
            actor
        );
        const searchResult = await academicYearService.getAcademicYears({
            search: "Searchable",
            page: 1,
            limit: 20,
        });
        assert(
            searchResult.data.some((row) => row.name === nameSearch),
            "Search should return matching academic years"
        );
        console.log("✓ Search returns matching academic years");

        // ---------- ARCHIVE / RESTORE ----------
        const archivable = await academicYearService.createAcademicYear(
            {
                name: `${prefix}ArchiveMe`,
                startDate: "2036-01-01",
                endDate: "2036-12-31",
                status: "INACTIVE",
            },
            actor
        );
        const archived = await academicYearService.deleteAcademicYear(
            archivable.id,
            actor
        );
        assert(archived.deletedAt, "Archive must set deletedAt");
        assert(archived.status === "ARCHIVED", "Archive must set ARCHIVED");
        assert(archived.isCurrent === false, "Archived must not be current");

        const archivedList = await academicYearService.getArchivedAcademicYears();
        assert(
            archivedList.some((row) => row.id === archivable.id),
            "Archived list must include soft-deleted year"
        );
        console.log("✓ Archive academic year succeeds");

        const restored = await academicYearService.restoreAcademicYear(
            archivable.id,
            { activate: false },
            actor
        );
        assert(!restored.deletedAt, "Restore must clear deletedAt");
        assert(
            restored.status === "INACTIVE",
            "Restore without activate keeps INACTIVE"
        );
        console.log("✓ Restore academic year succeeds");

        // ---------- AUDIT TRAIL ----------
        if (actor.userId) {
            const createAudit = await findAudit({
                entityType: "AcademicYear",
                recordId: yearB.id,
                action: "CREATE",
            });
            const updateAudit = await findAudit({
                entityType: "AcademicYear",
                recordId: yearA.id,
                action: "UPDATE",
            });
            const archiveAudit = await findAudit({
                entityType: "AcademicYear",
                recordId: archivable.id,
                action: "ARCHIVE",
            });
            const restoreAudit = await findAudit({
                entityType: "AcademicYear",
                recordId: archivable.id,
                action: "RESTORE",
            });

            assert(createAudit, "CREATE must write AcademicYear audit log");
            assert(updateAudit, "UPDATE must write AcademicYear audit log");
            assert(archiveAudit, "ARCHIVE must write AcademicYear audit log");
            assert(restoreAudit, "RESTORE must write AcademicYear audit log");
            assert(
                createAudit.module === "Academic Years",
                "Audit module must be Academic Years"
            );
            console.log("✓ Audit Trail CREATE/UPDATE/ARCHIVE/RESTORE present");
        } else {
            console.log(
                "⚠ Skipped audit assertions (no user available for actor.userId)"
            );
        }

        console.log("====================================");
        console.log("DIS-SMS Academic Year RC2 UAT Passed.");
        console.log("====================================");
    } finally {
        await cleanupByPrefix(prefix);
        await prisma.$disconnect();
    }
}

run().catch(async (error) => {
    console.error("FAIL:", error.message);
    try {
        await prisma.$disconnect();
    } catch {
        /* ignore */
    }
    process.exit(1);
});
