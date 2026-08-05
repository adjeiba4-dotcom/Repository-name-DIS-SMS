/**
 * Sprint 6.4 Subjects module smoke test.
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

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (expectStatus && response.status !== expectStatus) {
    throw new Error(
      `${method} ${path} expected ${expectStatus}, got ${response.status}: ${JSON.stringify(data)}`
    );
  }

  return { status: response.status, data };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const results = [];

  // RBAC — unauthenticated
  const unauth = await request("GET", "/subjects", { expectStatus: 401 });
  results.push(`RBAC unauthenticated: ${unauth.status}`);

  // Login
  const login = await request("POST", "/auth/login", {
    body: { email: "admin@dissms.com", password: "Admin@123" },
    expectStatus: 200,
  });
  const token =
    login.data?.data?.accessToken ||
    login.data?.data?.token ||
    login.data?.accessToken ||
    login.data?.token;
  assert(token, `Login failed: ${JSON.stringify(login.data)}`);
  results.push("Login OK");

  const code = `SMK${Date.now().toString().slice(-6)}`;
  const name = `Smoke Subject ${code}`;

  // CREATE
  const created = await request("POST", "/subjects", {
    token,
    body: {
      subjectCode: code,
      subjectName: name,
      shortName: "Smoke",
      category: "CORE",
      creditHours: 3,
      description: "Smoke test subject",
      status: "ACTIVE",
    },
    expectStatus: 201,
  });
  const subjectId = created.data?.data?.id;
  assert(subjectId, `Create failed: ${JSON.stringify(created.data)}`);
  assert(
    created.data.data.subjectCode === code,
    "Create response missing subjectCode"
  );
  results.push(`CREATE id=${subjectId}`);

  // Unique code conflict
  const conflict = await request("POST", "/subjects", {
    token,
    body: {
      subjectCode: code,
      subjectName: `${name} Dup`,
      shortName: "Dup",
      creditHours: 2,
    },
    expectStatus: 409,
  });
  results.push(`Unique code conflict: ${conflict.status}`);

  // LIST + pagination
  const list = await request("GET", "/subjects?page=1&limit=5", {
    token,
    expectStatus: 200,
  });
  assert(Array.isArray(list.data?.data), "List data not array");
  assert(list.data?.pagination, "Pagination missing");
  results.push(
    `LIST page=${list.data.pagination.page} total=${list.data.pagination.total}`
  );

  // SEARCH
  const search = await request(
    "GET",
    `/subjects?search=${encodeURIComponent(code)}`,
    { token, expectStatus: 200 }
  );
  assert(
    search.data.data.some((s) => s.id === subjectId),
    "Search did not find created subject"
  );
  results.push("SEARCH OK");

  // GET by id
  const detail = await request("GET", `/subjects/${subjectId}`, {
    token,
    expectStatus: 200,
  });
  assert(detail.data.data.subjectName === name, "Detail name mismatch");
  results.push("DETAIL OK");

  // UPDATE
  const updated = await request("PUT", `/subjects/${subjectId}`, {
    token,
    body: {
      shortName: "SmokeX",
      category: "ELECTIVE",
      creditHours: 4,
      status: "INACTIVE",
    },
    expectStatus: 200,
  });
  assert(updated.data.data.shortName === "SmokeX", "Update shortName failed");
  assert(updated.data.data.category === "ELECTIVE", "Update category failed");
  assert(updated.data.data.creditHours === 4, "Update creditHours failed");
  results.push("UPDATE OK");

  // creditHours validation
  const badCredits = await request("POST", "/subjects", {
    token,
    body: {
      subjectCode: `${code}B`,
      subjectName: `${name} Bad`,
      shortName: "Bad",
      creditHours: 0,
    },
    expectStatus: 400,
  });
  results.push(`creditHours>0 validation: ${badCredits.status}`);

  // ARCHIVE
  const archived = await request("DELETE", `/subjects/${subjectId}`, {
    token,
    expectStatus: 200,
  });
  assert(archived.data.data.deletedAt, "Archive did not set deletedAt");
  assert(archived.data.data.status === "ARCHIVED", "Archive status wrong");
  results.push("ARCHIVE OK");

  // Archived list
  const archivedList = await request("GET", "/subjects/archived", {
    token,
    expectStatus: 200,
  });
  assert(
    archivedList.data.data.some((s) => s.id === subjectId),
    "Archived list missing subject"
  );
  results.push("ARCHIVED LIST OK");

  // RESTORE
  const restored = await request("PATCH", `/subjects/${subjectId}/restore`, {
    token,
    body: { activate: true },
    expectStatus: 200,
  });
  assert(!restored.data.data.deletedAt, "Restore left deletedAt set");
  assert(restored.data.data.status === "ACTIVE", "Restore status wrong");
  results.push("RESTORE OK");

  // Swagger docs reachable
  const swagger = await fetch("http://localhost:5000/api-docs/");
  assert(swagger.ok || swagger.status === 301 || swagger.status === 302, "Swagger unavailable");
  results.push(`Swagger: ${swagger.status}`);

  // Cleanup — archive again
  await request("DELETE", `/subjects/${subjectId}`, {
    token,
    expectStatus: 200,
  });
  results.push("Cleanup archived");

  console.log("====================================");
  console.log("Subjects smoke test PASSED");
  console.log("====================================");
  results.forEach((line) => console.log(`✓ ${line}`));
}

main().catch((error) => {
  console.error("SMOKE TEST FAILED");
  console.error(error);
  process.exit(1);
});
