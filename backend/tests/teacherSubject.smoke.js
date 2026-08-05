/**
 * Smoke checks for Teacher Subject Assignment CRUD + duplicate guard + RBAC.
 * Prerequisites: at least one teacher, subject, academic year (seed script if needed).
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

async function main() {
    await request("GET", "/teacher-subjects", { expectStatus: 401 });

    const login = await request("POST", "/auth/login", {
        body: { email: "admin@dissms.com", password: "Admin@123" },
        expectStatus: 200,
    });
    const token =
        login.data?.data?.accessToken ||
        login.data?.data?.token ||
        login.data?.accessToken;
    if (!token) throw new Error("Login failed");

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

    const payload = {
        teacherId,
        subjectId,
        academicYearId,
        termId,
        isPrimary: true,
        weeklyPeriods: 4,
        remarks: `Smoke assignment ${Date.now()}`,
        status: "ACTIVE",
    };

    const created = await request("POST", "/teacher-subjects", {
        token,
        body: payload,
        expectStatus: 201,
    });
    const id = created.data.data.id;

    const listed = await request(
        "GET",
        "/teacher-subjects?search=Smoke&page=1&limit=10&sortBy=weeklyPeriods&sortOrder=desc",
        { token, expectStatus: 200 }
    );
    if (!Array.isArray(listed.data?.data)) {
        throw new Error("List response missing data array");
    }
    if (!listed.data.pagination) {
        throw new Error("List response missing pagination");
    }

    await request("POST", "/teacher-subjects", {
        token,
        body: { ...payload, weeklyPeriods: 0 },
        expectStatus: 400,
    });

    await request("POST", "/teacher-subjects", {
        token,
        body: payload,
        expectStatus: 409,
    });

    await request("PUT", `/teacher-subjects/${id}`, {
        token,
        body: { weeklyPeriods: 5, remarks: "Updated smoke" },
        expectStatus: 200,
    });

    await request("GET", `/teacher-subjects/${id}`, {
        token,
        expectStatus: 200,
    });

    await request("DELETE", `/teacher-subjects/${id}`, {
        token,
        expectStatus: 200,
    });

    await request("GET", "/teacher-subjects/archived", {
        token,
        expectStatus: 200,
    });

    await request("PATCH", `/teacher-subjects/${id}/restore`, {
        token,
        body: { activate: true },
        expectStatus: 200,
    });

    await request("DELETE", `/teacher-subjects/${id}`, {
        token,
        expectStatus: 200,
    });

    console.log("teacher-subject.smoke OK", {
        id,
        teacherId,
        subjectId,
        academicYearId,
        termId,
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
