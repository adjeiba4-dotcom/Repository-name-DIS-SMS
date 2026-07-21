const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

async function seedAdmin() {
    try {
        // Create Administrator role if it doesn't exist
        let adminRole = await prisma.role.findUnique({
            where: {
                name: "Administrator",
            },
        });

        if (!adminRole) {
            adminRole = await prisma.role.create({
                data: {
                    name: "Administrator",
                    description: "System Administrator",
                    status: "ACTIVE",
                },
            });

            console.log("✅ Administrator role created.");
        } else {
            console.log("ℹ️ Administrator role already exists.");
        }

        // Check if admin user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: "admin@dissms.com",
            },
        });

        if (existingUser) {
            console.log("ℹ️ Admin user already exists.");
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        // Create admin user
        await prisma.user.create({
            data: {
                firstName: "System",
                lastName: "Administrator",
                email: "admin@dissms.com",
                password: hashedPassword,
                role: {
                    connect: {
                        id: adminRole.id,
                    },
                },
                status: "ACTIVE",
            },
        });

        console.log("✅ Administrator user created successfully.");
        console.log("====================================");
        console.log("Email    : admin@dissms.com");
        console.log("Password : Admin@123");
        console.log("====================================");
    } catch (error) {
        console.error("❌ Seeder Error:");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();