/**
 * Seed minimal data for teacher-subject smoke when department API is blocked
 * by unrelated schema drift.
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const suffix = Date.now().toString().slice(-5);

    await prisma.$executeRawUnsafe(
        `INSERT INTO departments (code, name, description, status, createdAt, updatedAt)
         VALUES (?, ?, ?, 'ACTIVE', NOW(3), NOW(3))`,
        `TSD${suffix}`,
        `TS Dept ${suffix}`,
        "smoke"
    );

    const deptRows = await prisma.$queryRawUnsafe(
        `SELECT id FROM departments WHERE code = ?`,
        `TSD${suffix}`
    );
    const departmentId = Number(deptRows[0].id);

    await prisma.$executeRawUnsafe(
        `INSERT INTO teachers (staffNo, firstName, lastName, gender, departmentId, status, createdAt, updatedAt)
         VALUES (?, 'Smoke', 'Teacher', 'MALE', ?, 'ACTIVE', NOW(3), NOW(3))`,
        `TST${suffix}`,
        departmentId
    );

    const teacherRows = await prisma.$queryRawUnsafe(
        `SELECT id FROM teachers WHERE staffNo = ?`,
        `TST${suffix}`
    );
    const teacherId = Number(teacherRows[0].id);

    let subject = await prisma.subject.findFirst({
        where: { deletedAt: null },
    });
    if (!subject) {
        subject = await prisma.subject.create({
            data: {
                subjectCode: `TSS${suffix}`,
                subjectName: `TS Subject ${suffix}`,
                shortName: "TSS",
                creditHours: 2,
                category: "CORE",
                status: "ACTIVE",
            },
        });
    }

    let year = await prisma.academicYear.findFirst({
        where: { deletedAt: null },
    });
    if (!year) {
        year = await prisma.academicYear.create({
            data: {
                name: `TS Year ${suffix}`,
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-12-31"),
                status: "ACTIVE",
            },
        });
    }

    let term = await prisma.term.findFirst({
        where: { academicYearId: year.id, deletedAt: null },
    });
    if (!term) {
        term = await prisma.term.create({
            data: {
                academicYearId: year.id,
                code: "T1",
                name: `Term 1 ${suffix}`,
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-04-30"),
                status: "ACTIVE",
            },
        });
    }

    console.log(
        JSON.stringify({
            departmentId,
            teacherId,
            subjectId: subject.id,
            academicYearId: year.id,
            termId: term.id,
        })
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
