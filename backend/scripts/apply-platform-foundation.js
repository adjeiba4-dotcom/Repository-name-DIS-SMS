const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.join(
    __dirname,
    "..",
    "prisma",
    "migrations",
    "20260805160000_platform_foundation",
    "migration.sql"
  );
  const sql = fs.readFileSync(sqlPath, "utf8");
  const statements = sql
    .split(/;\s*\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--"));

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
      console.log("OK:", statement.slice(0, 72).replace(/\s+/g, " "));
    } catch (error) {
      console.log(
        "SKIP/ERR:",
        error.message.split("\n")[0],
        "::",
        statement.slice(0, 72).replace(/\s+/g, " ")
      );
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
