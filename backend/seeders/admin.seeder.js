const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

async function seedAdmin() {
    const password = await bcrypt.hash("Admin@123", 10);

    const existingUser = await prisma.user.findUnique({
        where: {
            email: "admin@dissms.com",
        },
    });

    if (existingUser) {
        console.log("Admin user already exists.");
        return;
    }

    await prisma.user.create({
        data: {
            firstName: "System",
            lastName: "Administrator",
            email: "admin@dissms.com",
            password,
            role: "Admin",
            status: "Active",
        },
    });

    console.log("✅ Admin user created successfully.");
}

seedAdmin()
    .catch(console.error)
    .finally(async() => {
        await prisma.$disconnect();
    });