/**
 * Classes module — RC2 UAT stability suite
 *
 * Covers Create, Edit (PUT), Archive, Restore, Search,
 * duplicate validation (exclude self), and Audit Trail writes.
 *
 * Run: node tests/class.api.test.js
 * Requires a live DATABASE_URL (uses service layer + Prisma).
 */

require("dotenv").config();

const classService = require("../services/class.service");
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
        userAgent: "class.api.test",
    };
}

async function ensureAcademicYear() {
    const existing = await prisma.academicYear.findFirst({
        where: { deletedAt: null },
        orderBy: { id: "desc" },
    });
    if (existing) return existing;

    return prisma.academicYear.create({
        data: {
            name: `Class-UAT-Year-${Date.now()}`,
            startDate: new Date("2046-01-01"),
            endDate: new Date("2046-12-31"),
            status: "INACTIVE",
            isCurrent: false,
        },
    });
}

async function countAudits({ recordId, action }) {
    return prisma.auditLog.count({
        where: {
            module: "Classes",
            entityType: "SchoolClass",
            recordId: Number(recordId),
            action,
        },
    });
}

async function main() {
    console.log("====================================");
    console.log("DIS-SMS Class API Test");
    console.log("====================================");

    const actor = await findAdminActor();
    const year = await ensureAcademicYear();
    const stamp = Date.now();
    const code = `TST-CLS-${stamp}`;

    // CREATE
    const created = await classService.createClass(
        {
            classCode: code,
            className: `Test Class ${stamp}`,
            academicYearId: year.id,
            departmentId: null,
            classTeacherId: null,
            capacity: 40,
            description: null,
            status: "ACTIVE",
        },
        actor
    );
    assert(created?.id, "Create should return an id.");
    assert(created.classCode === code, "Create should persist class code.");
    assert(
        (await countAudits({ recordId: created.id, action: "CREATE" })) >= 1,
        "Create should write an audit log."
    );
    console.log("✓ Create Class");

    // GET BY ID
    const detail = await classService.getClassById(created.id);
    assert(detail.id === created.id, "Get by id should return the class.");
    console.log("✓ Get Class By ID");

    // SEARCH
    const listed = await classService.getClasses({
        page: 1,
        limit: 20,
        search: code,
    });
    assert(
        listed.data.some((row) => row.id === created.id),
        "Search should find the created class."
    );
    console.log("✓ Search Classes");

    // UPDATE (unchanged code must not self-conflict)
    const updated = await classService.updateClass(
        created.id,
        {
            classCode: code,
            className: `Test Class ${stamp} Edited`,
            capacity: 45,
            status: "INACTIVE",
        },
        actor
    );
    assert(
        updated.className.endsWith("Edited"),
        "Update should persist class name."
    );
    assert(updated.capacity === 45, "Update should persist capacity.");
    assert(
        (await countAudits({ recordId: created.id, action: "UPDATE" })) >= 1,
        "Update should write an audit log."
    );
    console.log("✓ Update Class");

    // DUPLICATE create should fail
    let duplicateBlocked = false;
    try {
        await classService.createClass(
            {
                classCode: code,
                className: "Duplicate Probe",
                academicYearId: year.id,
                capacity: 10,
                status: "ACTIVE",
            },
            actor
        );
    } catch (error) {
        duplicateBlocked = /already exists/i.test(error.message);
    }
    assert(duplicateBlocked, "Duplicate class code should be rejected.");
    console.log("✓ Duplicate Validation");

    // ARCHIVE
    const archived = await classService.deleteClass(created.id, actor);
    assert(archived.deletedAt, "Archive should set deletedAt.");
    assert(
        (await countAudits({ recordId: created.id, action: "ARCHIVE" })) >= 1,
        "Archive should write an audit log."
    );
    console.log("✓ Archive Class");

    // RESTORE
    const restored = await classService.restoreClass(
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
    console.log("✓ Restore Class");

    // Cleanup
    await classService.deleteClass(created.id, actor);

    console.log("====================================");
    console.log("DIS-SMS Class Module Passed.");
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
