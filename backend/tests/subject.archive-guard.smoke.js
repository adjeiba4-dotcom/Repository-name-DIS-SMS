/**
 * Archive reference-guard smoke checks for Subjects.
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
  const login = await request("POST", "/auth/login", {
    body: { email: "admin@dissms.com", password: "Admin@123" },
    expectStatus: 200,
  });
  const token =
    login.data?.data?.accessToken ||
    login.data?.data?.token ||
    login.data?.accessToken;

  // Ensure a class exists for assignment
  let classId = null;
  const classes = await request("GET", "/classes?page=1&limit=1", {
    token,
    expectStatus: 200,
  });
  if (classes.data?.data?.length) {
    classId = classes.data.data[0].id;
  } else {
    const years = await request("GET", "/academic-years?page=1&limit=1", {
      token,
      expectStatus: 200,
    });
    const yearId = years.data?.data?.[0]?.id;
    if (!yearId) throw new Error("No academic year available for class create");
    const createdClass = await request("POST", "/classes", {
      token,
      body: {
        classCode: `SMK${Date.now().toString().slice(-4)}`,
        className: "Smoke Class Subject",
        academicYearId: yearId,
        capacity: 30,
        status: "ACTIVE",
      },
      expectStatus: 201,
    });
    classId = createdClass.data.data.id;
  }

  const code = `REF${Date.now().toString().slice(-6)}`;
  const created = await request("POST", "/subjects", {
    token,
    body: {
      subjectCode: code,
      subjectName: `Ref Guard ${code}`,
      shortName: "Ref",
      schoolClassId: classId,
      creditHours: 2,
      category: "CORE",
      status: "ACTIVE",
    },
    expectStatus: 201,
  });
  const id = created.data.data.id;

  const blocked = await request("DELETE", `/subjects/${id}`, {
    token,
    expectStatus: 409,
  });
  if (!String(blocked.data?.message || "").toLowerCase().includes("class")) {
    throw new Error(`Unexpected archive block message: ${JSON.stringify(blocked.data)}`);
  }

  // Clear class assignment then archive should succeed
  await request("PUT", `/subjects/${id}`, {
    token,
    body: { schoolClassId: null },
    expectStatus: 200,
  });
  await request("DELETE", `/subjects/${id}`, {
    token,
    expectStatus: 200,
  });

  console.log("Archive reference guards PASSED (class assignment blocks archive)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
