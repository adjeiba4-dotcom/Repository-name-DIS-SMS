/**
 * UAT prep: archive smoke/test/debug master data, seed production-like records.
 *
 * - Soft-archives (status=ARCHIVED, deletedAt=now) any referenced test rows
 * - Hard-deletes only orphan academic years with zero FK references
 * - Seeds realistic Academic Years, Terms, Departments, Classes, Subjects, Teachers, Students
 *
 * Usage: node scripts/uat-cleanup-and-seed.js
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TEST_PATTERNS = [
    /\btest\b/i,
    /\bdebug\b/i,
    /\bsmoke\b/i,
    /\bsample\b/i,
    /\bdummy\b/i,
    /\bdemo\b/i,
    /\bcap\b/i,
    /^dup\b/i,
    /^ts[sd]/i,
    /^tst/i,
    /^smk/i,
    /^ref/i,
    /^capa/i,
    /^capb/i,
    /smoke/i,
    /capacity/i,
];

function looksLikeTest(...parts) {
    const text = parts.filter(Boolean).join(" ");
    return TEST_PATTERNS.some((re) => re.test(text));
}

function archiveData(now = new Date()) {
    return { status: "ARCHIVED", deletedAt: now };
}

async function archiveWhere(model, where, label) {
    const result = await model.updateMany({
        where: { ...where, deletedAt: null },
        data: archiveData(),
    });
    if (result.count > 0) {
        console.log(`  archived ${result.count} ${label}`);
    }
    return result.count;
}

async function cleanupTestData() {
    console.log("\n=== Archiving / removing test & debug records ===");
    const now = new Date();

    // --- Identify academic years ---
    const years = await prisma.academicYear.findMany();
    const testYears = years.filter((y) => looksLikeTest(y.name));
    const keepYears = years.filter((y) => !looksLikeTest(y.name));

    console.log(
        `Academic years: ${testYears.length} test/debug, ${keepYears.length} keep`
    );

    for (const year of testYears) {
        const refs = {
            terms: await prisma.term.count({ where: { academicYearId: year.id } }),
            classes: await prisma.schoolClass.count({
                where: { academicYearId: year.id },
            }),
            enrollments: await prisma.enrollment.count({
                where: { academicYearId: year.id },
            }),
            attendance: await prisma.attendance.count({
                where: { academicYearId: year.id },
            }),
            examinations: await prisma.examination.count({
                where: { academicYearId: year.id },
            }),
            feeStructures: await prisma.feeStructure.count({
                where: { academicYearId: year.id },
            }),
            timetables: await prisma.timetable.count({
                where: { academicYearId: year.id },
            }),
            teacherSubjects: await prisma.teacherSubject.count({
                where: { academicYearId: year.id },
            }),
            classSubjects: await prisma.classSubject.count({
                where: { academicYearId: year.id },
            }),
            bedAllocations: await prisma.bedAllocation.count({
                where: { academicYearId: year.id },
            }),
        };
        const totalRefs = Object.values(refs).reduce((a, b) => a + b, 0);

        if (totalRefs === 0 && !year.deletedAt) {
            await prisma.academicYear.delete({ where: { id: year.id } });
            console.log(`  deleted orphan academic year: ${year.name} (id=${year.id})`);
            continue;
        }

        // Archive related active transactional rows first
        await archiveWhere(
            prisma.enrollment,
            { academicYearId: year.id },
            `enrollments for ${year.name}`
        );
        await archiveWhere(
            prisma.classSubject,
            { academicYearId: year.id },
            `class subjects for ${year.name}`
        );
        await archiveWhere(
            prisma.teacherSubject,
            { academicYearId: year.id },
            `teacher subjects for ${year.name}`
        );
        await archiveWhere(
            prisma.term,
            { academicYearId: year.id },
            `terms for ${year.name}`
        );
        await archiveWhere(
            prisma.schoolClass,
            { academicYearId: year.id },
            `classes for ${year.name}`
        );

        if (!year.deletedAt) {
            await prisma.academicYear.update({
                where: { id: year.id },
                data: { ...archiveData(now), isCurrent: false },
            });
            console.log(`  archived academic year: ${year.name} (id=${year.id})`);
        }
    }

    // --- Subjects ---
    const subjects = await prisma.subject.findMany({ where: { deletedAt: null } });
    for (const s of subjects) {
        if (looksLikeTest(s.subjectCode, s.subjectName, s.shortName)) {
            await prisma.subject.update({
                where: { id: s.id },
                data: archiveData(now),
            });
            console.log(`  archived subject: ${s.subjectCode} — ${s.subjectName}`);
        }
    }

    // --- Teachers ---
    const teachers = await prisma.teacher.findMany({ where: { deletedAt: null } });
    for (const t of teachers) {
        if (looksLikeTest(t.staffNo, t.firstName, t.lastName, t.email)) {
            await prisma.teacher.update({
                where: { id: t.id },
                data: archiveData(now),
            });
            console.log(`  archived teacher: ${t.staffNo} — ${t.firstName} ${t.lastName}`);
        }
    }

    // --- Departments ---
    const departments = await prisma.department.findMany({
        where: { deletedAt: null },
    });
    for (const d of departments) {
        if (looksLikeTest(d.code, d.name)) {
            // Teachers/subjects may still FK to department — archive, don't delete
            await prisma.department.update({
                where: { id: d.id },
                data: archiveData(now),
            });
            console.log(`  archived department: ${d.code} — ${d.name}`);
        }
    }

    // --- Students ---
    const students = await prisma.student.findMany({ where: { deletedAt: null } });
    for (const s of students) {
        if (looksLikeTest(s.admissionNo, s.firstName, s.lastName)) {
            await prisma.student.update({
                where: { id: s.id },
                data: archiveData(now),
            });
            console.log(
                `  archived student: ${s.admissionNo} — ${s.firstName} ${s.lastName}`
            );
        }
    }

    // --- Guardians ---
    const guardians = await prisma.guardian.findMany({ where: { deletedAt: null } });
    for (const g of guardians) {
        if (looksLikeTest(g.firstName, g.lastName, g.email)) {
            await prisma.guardian.update({
                where: { id: g.id },
                data: archiveData(now),
            });
            console.log(`  archived guardian: ${g.firstName} ${g.lastName}`);
        }
    }

    // Catch-all: any remaining active rows whose names still look like test data
    const leftoverClasses = await prisma.schoolClass.findMany({
        where: { deletedAt: null },
    });
    for (const c of leftoverClasses) {
        if (looksLikeTest(c.classCode, c.className)) {
            await prisma.schoolClass.update({
                where: { id: c.id },
                data: archiveData(now),
            });
            console.log(`  archived class: ${c.classCode} — ${c.className}`);
        }
    }

    const leftoverTerms = await prisma.term.findMany({ where: { deletedAt: null } });
    for (const t of leftoverTerms) {
        if (looksLikeTest(t.code, t.name)) {
            await prisma.term.update({
                where: { id: t.id },
                data: archiveData(now),
            });
            console.log(`  archived term: ${t.code} — ${t.name}`);
        }
    }
}

async function upsertDepartment({ code, name, description }) {
    const existing = await prisma.department.findFirst({
        where: {
            OR: [{ code }, { name }],
        },
    });
    if (existing) {
        return prisma.department.update({
            where: { id: existing.id },
            data: { code, name, description, status: "ACTIVE", deletedAt: null },
        });
    }
    return prisma.department.create({
        data: { code, name, description, status: "ACTIVE" },
    });
}

async function seedUatMasterData() {
    console.log("\n=== Seeding production-like UAT master data ===");

    // Academic years (Ghana SHS calendar: Sept → July)
    const prior = await prisma.academicYear.upsert({
        where: { name: "2024/2025" },
        update: {
            startDate: new Date("2024-09-02T00:00:00.000Z"),
            endDate: new Date("2025-07-25T23:59:59.000Z"),
            status: "INACTIVE",
            isCurrent: false,
            deletedAt: null,
        },
        create: {
            name: "2024/2025",
            startDate: new Date("2024-09-02T00:00:00.000Z"),
            endDate: new Date("2025-07-25T23:59:59.000Z"),
            status: "INACTIVE",
            isCurrent: false,
        },
    });
    console.log(`  academic year: ${prior.name} (INACTIVE)`);

    // Ensure only one ACTIVE/current year
    await prisma.academicYear.updateMany({
        where: { deletedAt: null, status: "ACTIVE", name: { not: "2025/2026" } },
        data: { status: "INACTIVE", isCurrent: false },
    });

    const current = await prisma.academicYear.upsert({
        where: { name: "2025/2026" },
        update: {
            startDate: new Date("2025-09-01T00:00:00.000Z"),
            endDate: new Date("2026-07-24T23:59:59.000Z"),
            status: "ACTIVE",
            isCurrent: true,
            deletedAt: null,
        },
        create: {
            name: "2025/2026",
            startDate: new Date("2025-09-01T00:00:00.000Z"),
            endDate: new Date("2026-07-24T23:59:59.000Z"),
            status: "ACTIVE",
            isCurrent: true,
        },
    });
    console.log(`  academic year: ${current.name} (ACTIVE / current)`);

    const termDefs = [
        {
            code: "T1",
            name: "Term 1",
            description: "First term",
            startDate: new Date("2025-09-01T00:00:00.000Z"),
            endDate: new Date("2025-12-12T23:59:59.000Z"),
            isCurrent: false,
            status: "INACTIVE",
        },
        {
            code: "T2",
            name: "Term 2",
            description: "Second term",
            startDate: new Date("2026-01-06T00:00:00.000Z"),
            endDate: new Date("2026-04-03T23:59:59.000Z"),
            isCurrent: true,
            status: "ACTIVE",
        },
        {
            code: "T3",
            name: "Term 3",
            description: "Third term",
            startDate: new Date("2026-04-20T00:00:00.000Z"),
            endDate: new Date("2026-07-24T23:59:59.000Z"),
            isCurrent: false,
            status: "INACTIVE",
        },
    ];

    const terms = {};
    for (const def of termDefs) {
        const existing = await prisma.term.findFirst({
            where: {
                academicYearId: current.id,
                OR: [{ code: def.code }, { name: def.name }],
            },
        });
        const term = existing
            ? await prisma.term.update({
                  where: { id: existing.id },
                  data: { ...def, academicYearId: current.id, deletedAt: null },
              })
            : await prisma.term.create({
                  data: { ...def, academicYearId: current.id },
              });
        terms[def.code] = term;
        console.log(
            `  term: ${term.code} — ${term.name} (${term.status}${term.isCurrent ? ", current" : ""})`
        );
    }

    const deptScience = await upsertDepartment({
        code: "SCI",
        name: "Science",
        description: "Science department",
    });
    const deptArts = await upsertDepartment({
        code: "ARTS",
        name: "General Arts",
        description: "General Arts department",
    });
    const deptBiz = await upsertDepartment({
        code: "BUS",
        name: "Business",
        description: "Business department",
    });
    const deptLang = await upsertDepartment({
        code: "LANG",
        name: "Languages",
        description: "Languages department",
    });
    console.log("  departments: SCI, ARTS, BUS, LANG");

    const teacherDefs = [
        {
            staffNo: "TCH001",
            firstName: "Akosua",
            lastName: "Mensah",
            gender: "FEMALE",
            email: "akosua.mensah@school.edu.gh",
            phone: "0244111001",
            qualification: "B.Ed Mathematics",
            departmentId: deptScience.id,
            employmentDate: new Date("2019-09-01"),
        },
        {
            staffNo: "TCH002",
            firstName: "Kwame",
            lastName: "Asante",
            gender: "MALE",
            email: "kwame.asante@school.edu.gh",
            phone: "0244111002",
            qualification: "M.Phil English",
            departmentId: deptLang.id,
            employmentDate: new Date("2018-01-15"),
        },
        {
            staffNo: "TCH003",
            firstName: "Ama",
            lastName: "Osei",
            gender: "FEMALE",
            email: "ama.osei@school.edu.gh",
            phone: "0244111003",
            qualification: "B.Sc Chemistry",
            departmentId: deptScience.id,
            employmentDate: new Date("2020-09-01"),
        },
        {
            staffNo: "TCH004",
            firstName: "Yaw",
            lastName: "Boateng",
            gender: "MALE",
            email: "yaw.boateng@school.edu.gh",
            phone: "0244111004",
            qualification: "B.Com Accounting",
            departmentId: deptBiz.id,
            employmentDate: new Date("2021-03-01"),
        },
    ];

    const teachersByStaffNo = {};
    for (const def of teacherDefs) {
        const existing = await prisma.teacher.findUnique({
            where: { staffNo: def.staffNo },
        });
        const teacher = existing
            ? await prisma.teacher.update({
                  where: { id: existing.id },
                  data: { ...def, status: "ACTIVE", deletedAt: null },
              })
            : await prisma.teacher.create({
                  data: { ...def, status: "ACTIVE" },
              });
        teachersByStaffNo[def.staffNo] = teacher;
        console.log(`  teacher: ${teacher.staffNo} — ${teacher.firstName} ${teacher.lastName}`);
    }

    const classDefs = [
        {
            classCode: "SHS1A",
            className: "SHS 1 Science A",
            departmentId: deptScience.id,
            classTeacherId: teachersByStaffNo.TCH001.id,
            capacity: 45,
            description: "Form 1 Science stream",
        },
        {
            classCode: "SHS1B",
            className: "SHS 1 General Arts A",
            departmentId: deptArts.id,
            classTeacherId: teachersByStaffNo.TCH002.id,
            capacity: 45,
            description: "Form 1 General Arts stream",
        },
        {
            classCode: "SHS2A",
            className: "SHS 2 Science A",
            departmentId: deptScience.id,
            classTeacherId: teachersByStaffNo.TCH003.id,
            capacity: 42,
            description: "Form 2 Science stream",
        },
        {
            classCode: "SHS2B",
            className: "SHS 2 Business A",
            departmentId: deptBiz.id,
            classTeacherId: teachersByStaffNo.TCH004.id,
            capacity: 40,
            description: "Form 2 Business stream",
        },
    ];

    const classesByCode = {};
    for (const def of classDefs) {
        const existing = await prisma.schoolClass.findFirst({
            where: {
                academicYearId: current.id,
                classCode: def.classCode,
            },
        });
        const cls = existing
            ? await prisma.schoolClass.update({
                  where: { id: existing.id },
                  data: {
                      ...def,
                      academicYearId: current.id,
                      status: "ACTIVE",
                      deletedAt: null,
                  },
              })
            : await prisma.schoolClass.create({
                  data: {
                      ...def,
                      academicYearId: current.id,
                      status: "ACTIVE",
                  },
              });
        classesByCode[def.classCode] = cls;
        console.log(`  class: ${cls.classCode} — ${cls.className}`);
    }

    const subjectDefs = [
        {
            subjectCode: "MATH",
            subjectName: "Core Mathematics",
            shortName: "Math",
            departmentId: deptScience.id,
            category: "CORE",
            creditHours: 4,
        },
        {
            subjectCode: "ENG",
            subjectName: "English Language",
            shortName: "Eng",
            departmentId: deptLang.id,
            category: "CORE",
            creditHours: 4,
        },
        {
            subjectCode: "ISCI",
            subjectName: "Integrated Science",
            shortName: "IntSci",
            departmentId: deptScience.id,
            category: "CORE",
            creditHours: 3,
        },
        {
            subjectCode: "SOST",
            subjectName: "Social Studies",
            shortName: "SocSt",
            departmentId: deptArts.id,
            category: "CORE",
            creditHours: 3,
        },
        {
            subjectCode: "PHYS",
            subjectName: "Physics",
            shortName: "Phys",
            departmentId: deptScience.id,
            category: "ELECTIVE",
            creditHours: 3,
        },
        {
            subjectCode: "CHEM",
            subjectName: "Chemistry",
            shortName: "Chem",
            departmentId: deptScience.id,
            category: "ELECTIVE",
            creditHours: 3,
        },
        {
            subjectCode: "ECON",
            subjectName: "Economics",
            shortName: "Econ",
            departmentId: deptBiz.id,
            category: "ELECTIVE",
            creditHours: 3,
        },
        {
            subjectCode: "ACCT",
            subjectName: "Financial Accounting",
            shortName: "Acct",
            departmentId: deptBiz.id,
            category: "ELECTIVE",
            creditHours: 3,
        },
    ];

    for (const def of subjectDefs) {
        const existing = await prisma.subject.findFirst({
            where: {
                OR: [{ subjectCode: def.subjectCode }, { subjectName: def.subjectName }],
            },
        });
        const subject = existing
            ? await prisma.subject.update({
                  where: { id: existing.id },
                  data: { ...def, status: "ACTIVE", deletedAt: null },
              })
            : await prisma.subject.create({
                  data: { ...def, status: "ACTIVE" },
              });
        console.log(`  subject: ${subject.subjectCode} — ${subject.subjectName}`);
    }

    const studentDefs = [
        {
            admissionNo: "ADM2025001",
            firstName: "Efua",
            lastName: "Agyeman",
            gender: "FEMALE",
            dateOfBirth: new Date("2010-05-14"),
            admissionDate: new Date("2025-09-01"),
            classId: classesByCode.SHS1A.id,
            phone: "0202000001",
        },
        {
            admissionNo: "ADM2025002",
            firstName: "Kofi",
            lastName: "Owusu",
            gender: "MALE",
            dateOfBirth: new Date("2010-11-02"),
            admissionDate: new Date("2025-09-01"),
            classId: classesByCode.SHS1A.id,
            phone: "0202000002",
        },
        {
            admissionNo: "ADM2025003",
            firstName: "Abena",
            lastName: "Darko",
            gender: "FEMALE",
            dateOfBirth: new Date("2009-08-21"),
            admissionDate: new Date("2024-09-02"),
            classId: classesByCode.SHS2A.id,
            phone: "0202000003",
        },
        {
            admissionNo: "ADM2025004",
            firstName: "Kojo",
            lastName: "Appiah",
            gender: "MALE",
            dateOfBirth: new Date("2009-03-30"),
            admissionDate: new Date("2024-09-02"),
            classId: classesByCode.SHS2B.id,
            phone: "0202000004",
        },
    ];

    for (const def of studentDefs) {
        const existing = await prisma.student.findUnique({
            where: { admissionNo: def.admissionNo },
        });
        const student = existing
            ? await prisma.student.update({
                  where: { id: existing.id },
                  data: { ...def, status: "ACTIVE", deletedAt: null },
              })
            : await prisma.student.create({
                  data: { ...def, status: "ACTIVE" },
              });
        console.log(
            `  student: ${student.admissionNo} — ${student.firstName} ${student.lastName}`
        );
    }

    // Prior-year terms (archived calendar context, inactive)
    const priorTermDefs = [
        {
            code: "T1",
            name: "Term 1",
            startDate: new Date("2024-09-02T00:00:00.000Z"),
            endDate: new Date("2024-12-13T23:59:59.000Z"),
        },
        {
            code: "T2",
            name: "Term 2",
            startDate: new Date("2025-01-06T00:00:00.000Z"),
            endDate: new Date("2025-04-04T23:59:59.000Z"),
        },
        {
            code: "T3",
            name: "Term 3",
            startDate: new Date("2025-04-21T00:00:00.000Z"),
            endDate: new Date("2025-07-25T23:59:59.000Z"),
        },
    ];
    for (const def of priorTermDefs) {
        const existing = await prisma.term.findFirst({
            where: {
                academicYearId: prior.id,
                OR: [{ code: def.code }, { name: def.name }],
            },
        });
        if (existing) {
            await prisma.term.update({
                where: { id: existing.id },
                data: {
                    ...def,
                    description: `${def.name} of ${prior.name}`,
                    status: "INACTIVE",
                    isCurrent: false,
                    deletedAt: null,
                },
            });
        } else {
            await prisma.term.create({
                data: {
                    ...def,
                    academicYearId: prior.id,
                    description: `${def.name} of ${prior.name}`,
                    status: "INACTIVE",
                    isCurrent: false,
                },
            });
        }
    }
    console.log(`  prior-year terms seeded for ${prior.name}`);
}

async function verifyActiveMasterData() {
    console.log("\n=== Active master data after cleanup (dropdown-visible) ===");
    const [years, terms, classes, subjects, teachers, departments, students] =
        await Promise.all([
            prisma.academicYear.findMany({
                where: { deletedAt: null },
                orderBy: { startDate: "desc" },
                select: { id: true, name: true, status: true, isCurrent: true },
            }),
            prisma.term.findMany({
                where: { deletedAt: null },
                orderBy: [{ academicYearId: "asc" }, { startDate: "asc" }],
                select: {
                    id: true,
                    code: true,
                    name: true,
                    status: true,
                    isCurrent: true,
                    academicYear: { select: { name: true } },
                },
            }),
            prisma.schoolClass.findMany({
                where: { deletedAt: null },
                orderBy: { classCode: "asc" },
                select: {
                    id: true,
                    classCode: true,
                    className: true,
                    status: true,
                    academicYear: { select: { name: true } },
                },
            }),
            prisma.subject.findMany({
                where: { deletedAt: null },
                orderBy: { subjectCode: "asc" },
                select: {
                    id: true,
                    subjectCode: true,
                    subjectName: true,
                    status: true,
                },
            }),
            prisma.teacher.findMany({
                where: { deletedAt: null },
                orderBy: { staffNo: "asc" },
                select: {
                    id: true,
                    staffNo: true,
                    firstName: true,
                    lastName: true,
                    status: true,
                },
            }),
            prisma.department.findMany({
                where: { deletedAt: null },
                orderBy: { code: "asc" },
                select: { id: true, code: true, name: true, status: true },
            }),
            prisma.student.findMany({
                where: { deletedAt: null },
                orderBy: { admissionNo: "asc" },
                select: {
                    id: true,
                    admissionNo: true,
                    firstName: true,
                    lastName: true,
                    status: true,
                },
            }),
        ]);

    console.log("Academic Years:", JSON.stringify(years, null, 2));
    console.log("Terms:", JSON.stringify(terms, null, 2));
    console.log("Classes:", JSON.stringify(classes, null, 2));
    console.log("Subjects:", JSON.stringify(subjects, null, 2));
    console.log("Teachers:", JSON.stringify(teachers, null, 2));
    console.log("Departments:", JSON.stringify(departments, null, 2));
    console.log("Students:", JSON.stringify(students, null, 2));
}

async function main() {
    await cleanupTestData();
    await seedUatMasterData();
    await verifyActiveMasterData();
    console.log("\nUAT master-data cleanup complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
