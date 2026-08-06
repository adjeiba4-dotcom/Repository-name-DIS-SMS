/**
 * Subjects module — production UAT stability suite
 *
 * Covers Create, Edit (PUT), Archive, Restore, Search,
 * duplicate validation, archive reference guards, and Audit Trail writes.
 *
 * Run: node tests/subject.api.test.js
 * Requires a live DATABASE_URL (uses service layer + Prisma).
 */

require("dotenv").config();

const subjectService = require("../services/subject.service");
const prisma = require("../database/db");

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function findAdminActor() {
    const admin = await prisma.user.findFirst({
        where: { email: "admin@dissms.com" },
        select: { id: true },
    });
    assert(admin?.id, "Admin user required for audit actor.");
    return {
        userId: admin.id,
        ipAddress: "127.0.0.1",
        userAgent: "subject.api.test",
    };
}

async function countAudits({ recordId, action }) {
    return prisma.auditLog.count({
        where: {
            module: "Subjects",
            entityType: "Subject",
            recordId: Number(recordId),
            action,
        },
    });
}

async function main() {
    console.log("====================================");
    console.log("DIS-SMS Subject API Test");
    console.log("====================================");

    const actor = await findAdminActor();
    const stamp = Date.now();
    const code = `TST-SUB-${stamp}`;
    const name = `Test Subject ${stamp}`;

    // CREATE
    const created = await subjectService.createSubject(
        {
            subjectCode: code,
            subjectName: name,
            shortName: "TST",
            departmentId: null,
            schoolClassId: null,
            category: "CORE",
            creditHours: 3,
            description: null,
            status: "ACTIVE",
        },
        actor
    );
    assert(created?.id, "Create should return an id.");
    assert(created.subjectCode === code, "Create should persist subject code.");
    assert(
        (await countAudits({ recordId: created.id, action: "CREATE" })) >= 1,
        "Create should write an audit log."
    );
    console.log("✓ Create Subject");

    // GET BY ID
    const detail = await subjectService.getSubjectById(created.id);
    assert(detail.id === created.id, "Get by id should return the subject.");
    console.log("✓ Get Subject By ID");

    // SEARCH
    const listed = await subjectService.getSubjects({
        page: 1,
        limit: 20,
        search: code,
    });
    assert(
        listed.data.some((row) => row.id === created.id),
        "Search should find the created subject."
    );
    console.log("✓ Search Subjects");

    // UPDATE (unchanged code/name must not self-conflict)
    const updated = await subjectService.updateSubject(
        created.id,
        {
            subjectCode: code,
            subjectName: `${name} Edited`,
            shortName: "TSTE",
            creditHours: 4,
            category: "ELECTIVE",
            status: "INACTIVE",
        },
        actor
    );
    assert(
        updated.subjectName.endsWith("Edited"),
        "Update should persist subject name."
    );
    assert(updated.creditHours === 4, "Update should persist credit hours.");
    assert(updated.category === "ELECTIVE", "Update should persist category.");
    assert(
        (await countAudits({ recordId: created.id, action: "UPDATE" })) >= 1,
        "Update should write an audit log."
    );
    console.log("✓ Update Subject");

    // DUPLICATE create should fail
    let duplicateBlocked = false;
    try {
        await subjectService.createSubject(
            {
                subjectCode: code,
                subjectName: "Duplicate Probe Subject",
                shortName: "DUP",
                creditHours: 2,
                status: "ACTIVE",
            },
            actor
        );
    } catch (error) {
        duplicateBlocked = /already exists/i.test(error.message);
    }
    assert(duplicateBlocked, "Duplicate subject code should be rejected.");
    console.log("✓ Duplicate Validation");

    // ARCHIVE GUARD — legacy class assignment
    let year = await prisma.academicYear.findFirst({
        where: { deletedAt: null },
        orderBy: { id: "desc" },
    });
    if (!year) {
        year = await prisma.academicYear.create({
            data: {
                name: `Subject-UAT-Year-${stamp}`,
                startDate: new Date("2046-01-01"),
                endDate: new Date("2046-12-31"),
                status: "INACTIVE",
                isCurrent: false,
            },
        });
    }

    const schoolClass = await prisma.schoolClass.create({
        data: {
            classCode: `SUB-CLS-${stamp}`,
            className: `Subject Guard Class ${stamp}`,
            academicYearId: year.id,
            capacity: 30,
            status: "ACTIVE",
        },
    });

    await subjectService.updateSubject(
        created.id,
        { schoolClassId: schoolClass.id },
        actor
    );

    let archiveBlocked = false;
    try {
        await subjectService.deleteSubject(created.id, actor);
    } catch (error) {
        archiveBlocked = /class assignments/i.test(error.message);
    }
    assert(
        archiveBlocked,
        "Archive should be blocked when a class assignment exists."
    );
    console.log("✓ Archive Reference Guard");

    await subjectService.updateSubject(
        created.id,
        { schoolClassId: null },
        actor
    );

    // ARCHIVE
    const archived = await subjectService.deleteSubject(created.id, actor);
    assert(archived.deletedAt, "Archive should set deletedAt.");
    assert(archived.status === "ARCHIVED", "Archive should set ARCHIVED.");
    assert(
        (await countAudits({ recordId: created.id, action: "ARCHIVE" })) >= 1,
        "Archive should write an audit log."
    );
    console.log("✓ Archive Subject");

    // RESTORE
    const restored = await subjectService.restoreSubject(
        created.id,
        { activate: true },
        actor
    );
    assert(!restored.deletedAt, "Restore should clear deletedAt.");
    assert(restored.status === "ACTIVE", "Restore activate should set ACTIVE.");
    assert(
        (await countAudits({ recordId: created.id, action: "RESTORE" })) >= 1,
        "Restore should write an audit log."
    );
    console.log("✓ Restore Subject");

    // Cleanup
    await subjectService.deleteSubject(created.id, actor);
    await prisma.schoolClass.delete({ where: { id: schoolClass.id } }).catch(() => {});

    console.log("====================================");
    console.log("DIS-SMS Subject Module Passed.");
    console.log("====================================");
}

main()
    .catch((error) => {
        console.error("FAIL:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
