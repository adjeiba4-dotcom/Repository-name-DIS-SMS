const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const checks = [
    "SHOW COLUMNS FROM audit_logs LIKE 'entityType'",
    "SHOW COLUMNS FROM system_settings LIKE 'category'",
    "SHOW COLUMNS FROM notifications LIKE 'channel'",
    "SHOW TABLES LIKE 'school_profiles'",
    "SHOW TABLES LIKE 'file_assets'",
  ];

  for (const sql of checks) {
    try {
      const rows = await prisma.$queryRawUnsafe(sql);
      console.log(sql, "=>", rows);
    } catch (error) {
      console.log(sql, "ERR", error.message);
    }
  }
}

main().finally(() => prisma.$disconnect());
