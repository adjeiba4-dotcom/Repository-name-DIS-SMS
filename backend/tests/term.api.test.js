/**
 * Term module — RC2 UAT stability suite
 *
 * Covers success and failure paths for:
 * Create, Edit (PUT), Archive, Restore, Search,
 * academic-year dropdown ID linkage, date-within-year validation,
 * duplicate name/code (exclude self), overlap, active/current,
 * and Audit Trail writes.
 *
 * Run: node tests/term.api.test.js
 * Requires a live DATABASE_URL (uses service layer + Prisma).
 */

require("dotenv").config();

const academicYearService = require("../services/academicYear.service");
const termService = require("../services/term.service");
const termRepository = require("../repositories/term.repository");
const prisma = require("../database/db");

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function toDateInput(value) {
    return new Date(value).toISOString().slice(0, 10);
}

async function cleanup(prefix) {
    await prisma.term.deleteMany({
        where: {
            OR: [
                { name: { startsWith: prefix } },
                { code: { startsWith: prefix } },
            ],
        },
    });
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
    const prefix = `UAT-TM-${Date.now()}-`;

    const admin =
        (await prisma.user.findFirst({
            where: { deletedAt: null },
            orderBy: { id: "asc" },
        })) || null;
    const actor = admin
        ? { userId: admin.id, ipAddress: "127.0.0.1", userAgent: "uat-test" }
        : {};

    console.log("====================================");
    console.log("DIS-SMS Term RC2 UAT Suite");
    console.log("====================================");

    try {
        await cleanup(prefix);

        const year = await academicYearService.createAcademicYear(
            {
                name: `${prefix}Year`,
                startDate: "2040-01-01",
                endDate: "2040-12-31",
                status: "INACTIVE",
            },
            actor
        );

        // Dropdown / FK: academic year lookup must return the same numeric id
        const lookedUp = await termRepository.findAcademicYearById(year.id);
        assert(lookedUp?.id === year.id, "Academic year dropdown id must resolve");
        assert(
            lookedUp?.id === Number(String(year.id)),
            "Academic year id must coerce from string form used by UI selects"
        );
        console.log("✓ Academic Year dropdown IDs resolve correctly");

        // ---------- CREATE (success) ----------
        const termA = await termService.createTerm(
            {
                academicYearId: year.id,
                code: `${prefix}T1`,
                name: `${prefix}First`,
                description: "UAT term",
                startDate: "2040-01-01",
                endDate: "2040-04-30",
                status: "INACTIVE",
            },
            actor
        );
        assert(termA?.id, "Create should return a term with id");
        assert(termA.academicYearId === year.id, "Create must link academicYearId");
        assert(
            toDateInput(termA.startDate) === "2040-01-01",
            "Create should persist startDate"
        );
        assert(
            toDateInput(termA.endDate) === "2040-04-30",
            "Create should persist endDate"
        );
        console.log("✓ Create term succeeds");

        // ---------- FAIL: dates outside academic year ----------
        let outsideBlocked = false;
        try {
            await termService.createTerm({
                academicYearId: year.id,
                code: `${prefix}OUT`,
                name: `${prefix}Outside`,
                startDate: "2041-01-01",
                endDate: "2041-03-31",
                status: "INACTIVE",
            });
        } catch (error) {
            outsideBlocked =
                error?.statusCode === 400 &&
                /Term dates must fall within academic year/i.test(error.message);
        }
        assert(
            outsideBlocked,
            "Dates outside academic year must fail with 400"
        );
        console.log("✓ Dates outside academic year are rejected");

        // ---------- FAIL: invalid date order ----------
        let badOrderBlocked = false;
        try {
            await termService.createTerm({
                academicYearId: year.id,
                code: `${prefix}BAD`,
                name: `${prefix}BadOrder`,
                startDate: "2040-06-01",
                endDate: "2040-01-01",
                status: "INACTIVE",
            });
        } catch (error) {
            badOrderBlocked =
                error?.statusCode === 400 &&
                /Start date must be earlier than end date/i.test(error.message);
        }
        assert(badOrderBlocked, "Invalid date order must fail with 400");
        console.log("✓ Invalid date order is rejected");

        // ---------- FAIL: duplicate code/name ----------
        let dupCodeBlocked = false;
        try {
            await termService.createTerm({
                academicYearId: year.id,
                code: `${prefix}T1`,
                name: `${prefix}OtherName`,
                startDate: "2040-05-01",
                endDate: "2040-08-31",
                status: "INACTIVE",
            });
        } catch (error) {
            dupCodeBlocked =
                error?.statusCode === 409 &&
                /code already exists/i.test(error.message);
        }
        assert(dupCodeBlocked, "Duplicate code must fail with 409");
        console.log("✓ Duplicate code is rejected");

        // ---------- CREATE second term + overlap ----------
        const termB = await termService.createTerm(
            {
                academicYearId: year.id,
                code: `${prefix}T2`,
                name: `${prefix}Second`,
                startDate: "2040-05-01",
                endDate: "2040-08-31",
                status: "INACTIVE",
            },
            actor
        );

        let overlapBlocked = false;
        try {
            await termService.createTerm({
                academicYearId: year.id,
                code: `${prefix}T3`,
                name: `${prefix}Overlap`,
                startDate: "2040-04-15",
                endDate: "2040-05-15",
                status: "INACTIVE",
            });
        } catch (error) {
            overlapBlocked =
                error?.statusCode === 409 &&
                /overlap/i.test(error.message);
        }
        assert(overlapBlocked, "Overlapping dates must fail with 409");
        console.log("✓ Overlapping term dates are rejected");

        // ---------- ACTIVE / CURRENT ----------
        const activated = await termService.updateTerm(
            termA.id,
            { status: "ACTIVE" },
            actor
        );
        assert(activated.status === "ACTIVE", "Activate via update sets ACTIVE");
        assert(activated.isCurrent === true, "ACTIVE term is current");

        const secondActive = await termService.updateTerm(
            termB.id,
            { status: "ACTIVE" },
            actor
        );
        assert(secondActive.isCurrent === true, "Newest ACTIVE is current");
        const demoted = await termRepository.findTermById(termA.id);
        assert(
            demoted.status === "INACTIVE" && demoted.isCurrent === false,
            "Previous ACTIVE term must be demoted"
        );
        console.log("✓ Active/current term logic demotes prior ACTIVE");

        // ---------- UPDATE (exclude self) ----------
        const unchanged = await termService.updateTerm(
            String(termB.id),
            {
                academicYearId: year.id,
                code: `${prefix}T2`,
                name: `${prefix}Second`,
                startDate: "2040-05-01",
                endDate: "2040-08-31",
                status: "INACTIVE",
            },
            actor
        );
        assert(
            unchanged.name === `${prefix}Second`,
            "Edit without changing name/code must succeed"
        );
        console.log("✓ Edit without name/code change succeeds (PUT path)");

        const renamed = await termService.updateTerm(
            termB.id,
            {
                name: `${prefix}SecondRenamed`,
                endDate: "2040-09-15",
            },
            actor
        );
        assert(
            renamed.name === `${prefix}SecondRenamed`,
            "Unique rename must succeed"
        );
        assert(
            toDateInput(renamed.endDate) === "2040-09-15",
            "Updated endDate must persist"
        );
        console.log("✓ Rename + date update succeeds");

        let renameDupBlocked = false;
        try {
            await termService.updateTerm(termB.id, {
                name: `${prefix}First`,
            });
        } catch (error) {
            renameDupBlocked =
                error?.statusCode === 409 &&
                /name already exists/i.test(error.message);
        }
        assert(renameDupBlocked, "Rename to existing name must fail");
        console.log("✓ Rename to existing name is rejected");

        // ---------- SEARCH ----------
        const searchResult = await termService.getTerms({
            search: "SecondRenamed",
            page: 1,
            limit: 20,
        });
        assert(
            searchResult.data.some((row) => row.id === termB.id),
            "Search should return matching terms"
        );
        console.log("✓ Search returns matching terms");

        // ---------- ARCHIVE / RESTORE ----------
        const archived = await termService.deleteTerm(termB.id, actor);
        assert(archived.deletedAt, "Archive must set deletedAt");
        assert(archived.status === "ARCHIVED", "Archive must set ARCHIVED");

        const archivedList = await termService.getArchivedTerms();
        assert(
            archivedList.some((row) => row.id === termB.id),
            "Archived list must include soft-deleted term"
        );
        console.log("✓ Archive term succeeds");

        const restored = await termService.restoreTerm(
            termB.id,
            { activate: false },
            actor
        );
        assert(!restored.deletedAt, "Restore must clear deletedAt");
        assert(
            restored.status === "INACTIVE",
            "Restore without activate keeps INACTIVE"
        );
        console.log("✓ Restore term succeeds");

        // ---------- AUDIT TRAIL ----------
        if (actor.userId) {
            const createAudit = await findAudit({
                entityType: "Term",
                recordId: termA.id,
                action: "CREATE",
            });
            const updateAudit = await findAudit({
                entityType: "Term",
                recordId: termB.id,
                action: "UPDATE",
            });
            const archiveAudit = await findAudit({
                entityType: "Term",
                recordId: termB.id,
                action: "ARCHIVE",
            });
            const restoreAudit = await findAudit({
                entityType: "Term",
                recordId: termB.id,
                action: "RESTORE",
            });

            assert(createAudit, "CREATE must write Term audit log");
            assert(updateAudit, "UPDATE must write Term audit log");
            assert(archiveAudit, "ARCHIVE must write Term audit log");
            assert(restoreAudit, "RESTORE must write Term audit log");
            assert(createAudit.module === "Terms", "Audit module must be Terms");
            console.log("✓ Audit Trail CREATE/UPDATE/ARCHIVE/RESTORE present");
        } else {
            console.log(
                "⚠ Skipped audit assertions (no user available for actor.userId)"
            );
        }

        console.log("====================================");
        console.log("DIS-SMS Term RC2 UAT Passed.");
        console.log("====================================");
    } finally {
        await cleanup(prefix);
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
