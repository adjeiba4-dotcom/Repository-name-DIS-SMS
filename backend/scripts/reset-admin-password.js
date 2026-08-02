const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const plainPassword = "Admin@123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = await prisma.user.findUnique({
        where: {
            email: "admin@dissms.com",
        },
    });

    if (!admin) {
        console.log("❌ Administrator account not found.");
        return;
    }

    await prisma.user.update({
        where: {
            email: "admin@dissms.com",
        },
        data: {
            password: hashedPassword,
        },
    });

    console.log("======================================");
    console.log("✅ Administrator password reset");
    console.log("======================================");
    console.log("Email    : admin@dissms.com");
    console.log("Password : Admin@123");
    console.log("======================================");
}

main()
    .catch((error) => {
        console.error(error);
    })
    .finally(async() => {
        await prisma.$disconnect();
    });