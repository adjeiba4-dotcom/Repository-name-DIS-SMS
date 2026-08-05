const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("models", Object.keys(prisma).filter((k) => !k.startsWith("$") && !k.startsWith("_")).slice(0, 30));
  try {
    const school = await prisma.schoolProfile.findFirst();
    console.log("schoolProfile ok", school);
  } catch (error) {
    console.error("schoolProfile err", error.message);
  }
}

main().finally(() => prisma.$disconnect());
