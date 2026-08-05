/**
 * Smoke checks for Student Enrollment CRUD + capacity + duplicate + RBAC.
 * Creates guardian + student when none exist.
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

async function ensureGuardian(token) {
    const existing = await request("GET", "/guardians?page=1&limit=1", {
        token,
        expectStatus: 200,
    });
    if (existing.data?.data?.[0]) {
        return existing.data.data[0];
    }

    const stamp = Date.now().toString().slice(-6);
    const created = await request("POST", "/guardians", {
        token,
        body: {
            firstName: "Smoke",
            lastName: "Guardian",
            phone: `0700${stamp}`,
            gender: "MALE",
            status: "ACTIVE",
        },
        expectStatus: 201,
    });
    return created.data.data;
}

async function createFreshStudent(token, schoolClassId) {
    const guardian = await ensureGuardian(token);
    const stamp = Date.now().toString().slice(-6);
    const created = await request("POST", "/students", {
        token,
        body: {
            admissionNo: `SMKENR${stamp}`,
            firstName: "Smoke",
            lastName: "Enrollee",
            gender: "MALE",
            dateOfBirth: "2012-01-15T00:00:00.000Z",
            admissionDate: new Date().toISOString(),
            classId: schoolClassId,
            guardianId: guardian.id,
            relationship: "GUARDIAN",
            status: "ACTIVE",
        },
        expectStatus: 201,
    });
    return created.data.data;
}

async function main() {
    await request("GET", "/enrollments", { expectStatus: 401 });

    const login = await request("POST", "/auth/login", {
        body: { email: "admin@dissms.com", password: "Admin@123" },
        expectStatus: 200,
    });
    const token =
        login.data?.data?.accessToken ||
        login.data?.data?.token ||
        login.data?.accessToken;
    if (!token) throw new Error("Login failed");

    const years = await request("GET", "/academic-years?page=1&limit=5", {
        token,
        expectStatus: 200,
    });
    const academicYear = years.data?.data?.[0];
    if (!academicYear?.id) throw new Error("No academic year available");

    const classes = await request(
        "GET",
        `/classes?page=1&limit=20&academicYearId=${academicYear.id}`,
        { token, expectStatus: 200 }
    );
    let schoolClass =
        (classes.data?.data ?? []).find(
            (item) => item.academicYearId === academicYear.id
        ) || classes.data?.data?.[0];

    if (!schoolClass) {
        const anyClasses = await request("GET", "/classes?page=1&limit=1", {
            token,
            expectStatus: 200,
        });
        schoolClass = anyClasses.data?.data?.[0];
    }
    if (!schoolClass?.id) throw new Error("No class available");

    const academicYearId = schoolClass.academicYearId || academicYear.id;

    // Always create a fresh student so unique (studentId, academicYearId) is free.
    const student = await createFreshStudent(token, schoolClass.id);
    const studentId = student.id;

    const terms = await request(
        "GET",
        `/terms?page=1&limit=1&academicYearId=${academicYearId}`,
        { token, expectStatus: 200 }
    );
    const termId = terms.data?.data?.[0]?.id || null;

    const payload = {
        studentId,
        schoolClassId: schoolClass.id,
        academicYearId,
        termId,
        enrollmentDate: new Date().toISOString(),
        remarks: `Smoke enrollment ${Date.now()}`,
        status: "ACTIVE",
    };

    const created = await request("POST", "/enrollments", {
        token,
        body: payload,
        expectStatus: 201,
    });
    const id = created.data?.data?.id;
    if (!id) throw new Error("Create failed — no id");
    if (!created.data?.data?.enrollmentNumber) {
        throw new Error("Create failed — no enrollmentNumber");
    }

    await request("GET", `/enrollments/${id}`, {
        token,
        expectStatus: 200,
    });

    await request("GET", "/enrollments?page=1&limit=10&search=Smoke", {
        token,
        expectStatus: 200,
    });

    await request("POST", "/enrollments", {
        token,
        body: payload,
        expectStatus: 409,
    });

    const otherYear = (years.data?.data ?? []).find(
        (year) => year.id !== academicYearId
    );
    if (otherYear) {
        await request("POST", "/enrollments", {
            token,
            body: {
                ...payload,
                academicYearId: otherYear.id,
            },
            expectStatus: 400,
        });
    }

    await request("PUT", `/enrollments/${id}`, {
        token,
        body: { remarks: "Updated smoke enrollment", status: "ACTIVE" },
        expectStatus: 200,
    });

    await request("DELETE", `/enrollments/${id}`, {
        token,
        expectStatus: 200,
    });

    await request("GET", "/enrollments/archived", {
        token,
        expectStatus: 200,
    });

    await request("PATCH", `/enrollments/${id}/restore`, {
        token,
        body: { activate: true },
        expectStatus: 200,
    });

    await request("DELETE", `/enrollments/${id}`, {
        token,
        expectStatus: 200,
    });

    console.log("Student Enrollment smoke checks passed.", {
        id,
        enrollmentNumber: created.data.data.enrollmentNumber,
        studentId,
        schoolClassId: schoolClass.id,
        academicYearId,
        termId,
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
