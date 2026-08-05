/**
 * Smoke checks for Class Subject Allocation CRUD + duplicate guard + RBAC.
 * Creates a teacher-subject assignment when none exist.
 */
const BASE = "http://localhost:5000/api";

async function request(method, path, { token, body, expectStatus } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => null);
    if (expectStatus && response.status !== expectStatus) {
        throw new Error(
            `${method} ${path} expected ${expectStatus}, got ${response.status}: ${JSON.stringify(data)}`
        );
    }
    return { status: response.status, data };
}

async function ensureTeacherSubject(token) {
    const existing = await request(
        "GET",
        "/teacher-subjects?page=1&limit=1&status=ACTIVE",
        { token, expectStatus: 200 }
    );
    if (existing.data?.data?.[0]) {
        return existing.data.data[0];
    }

    const teachers = await request("GET", "/teachers", {
        token,
        expectStatus: 200,
    });
    const teacherId = teachers.data?.data?.[0]?.id;
    if (!teacherId) {
        throw new Error(
            "No teacher available. Run: node tests/seed-teacher-subject-smoke.js"
        );
    }

    const subjects = await request("GET", "/subjects?page=1&limit=1", {
        token,
        expectStatus: 200,
    });
    const subjectId = subjects.data?.data?.[0]?.id;
    if (!subjectId) throw new Error("No subject available");

    const years = await request("GET", "/academic-years?page=1&limit=1", {
        token,
        expectStatus: 200,
    });
    const academicYearId = years.data?.data?.[0]?.id;
    if (!academicYearId) throw new Error("No academic year available");

    const terms = await request(
        "GET",
        `/terms?page=1&limit=1&academicYearId=${academicYearId}`,
        { token, expectStatus: 200 }
    );
    const termId = terms.data?.data?.[0]?.id || null;

    const created = await request("POST", "/teacher-subjects", {
        token,
        body: {
            teacherId,
            subjectId,
            academicYearId,
            termId,
            isPrimary: true,
            weeklyPeriods: 4,
            remarks: `Class-subject smoke TS ${Date.now()}`,
            status: "ACTIVE",
        },
        expectStatus: 201,
    });

    return created.data.data;
}

async function main() {
    await request("GET", "/class-subjects", { expectStatus: 401 });

    const login = await request("POST", "/auth/login", {
        body: { email: "admin@dissms.com", password: "Admin@123" },
        expectStatus: 200,
    });
    const token =
        login.data?.data?.accessToken ||
        login.data?.data?.token ||
        login.data?.accessToken;
    if (!token) throw new Error("Login failed");

    const teacherSubject = await ensureTeacherSubject(token);

    const classes = await request("GET", "/classes?page=1&limit=1", {
        token,
        expectStatus: 200,
    });
    const schoolClassId = classes.data?.data?.[0]?.id;
    if (!schoolClassId) throw new Error("No class available");

    const academicYearId = teacherSubject.academicYearId;
    const termId = teacherSubject.termId || null;

    const payload = {
        schoolClassId,
        teacherSubjectId: teacherSubject.id,
        academicYearId,
        termId,
        weeklyPeriods: 5,
        isCompulsory: true,
        displayOrder: 1,
        remarks: `Smoke allocation ${Date.now()}`,
        status: "ACTIVE",
    };

    const created = await request("POST", "/class-subjects", {
        token,
        body: payload,
        expectStatus: 201,
    });
    const id = created.data?.data?.id;
    if (!id) throw new Error("Create failed — no id");

    if (created.data.data.subjectId !== teacherSubject.subjectId) {
        throw new Error("Subject was not derived from TeacherSubject");
    }

    await request("GET", `/class-subjects/${id}`, {
        token,
        expectStatus: 200,
    });

    await request("GET", "/class-subjects?page=1&limit=10&search=Smoke", {
        token,
        expectStatus: 200,
    });

    await request("POST", "/class-subjects", {
        token,
        body: payload,
        expectStatus: 409,
    });

    await request("POST", "/class-subjects", {
        token,
        body: { ...payload, weeklyPeriods: 0 },
        expectStatus: 400,
    });

    const years = await request("GET", "/academic-years?page=1&limit=20", {
        token,
        expectStatus: 200,
    });
    const otherYear = (years.data?.data ?? []).find(
        (year) => year.id !== academicYearId
    );
    if (otherYear) {
        await request("POST", "/class-subjects", {
            token,
            body: {
                ...payload,
                academicYearId: otherYear.id,
            },
            expectStatus: 400,
        });
    } else {
        await request("POST", "/class-subjects", {
            token,
            body: {
                ...payload,
                academicYearId: academicYearId + 99999,
            },
            expectStatus: 404,
        });
    }

    await request("PUT", `/class-subjects/${id}`, {
        token,
        body: { weeklyPeriods: 6, remarks: "Updated smoke allocation" },
        expectStatus: 200,
    });

    await request("DELETE", `/class-subjects/${id}`, {
        token,
        expectStatus: 200,
    });

    await request("GET", "/class-subjects/archived", {
        token,
        expectStatus: 200,
    });

    await request("PATCH", `/class-subjects/${id}/restore`, {
        token,
        body: { activate: true },
        expectStatus: 200,
    });

    await request("DELETE", `/class-subjects/${id}`, {
        token,
        expectStatus: 200,
    });

    console.log("Class Subject Allocation smoke checks passed.", {
        id,
        schoolClassId,
        teacherSubjectId: teacherSubject.id,
        academicYearId,
        termId,
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
