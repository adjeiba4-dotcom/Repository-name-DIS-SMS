const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const {
  DEFAULT_PLATFORM_CONFIG,
} = require("../constants/platformConfig");

async function seedPlatformDefaults() {
  for (const entry of DEFAULT_PLATFORM_CONFIG) {
    await prisma.systemSetting.upsert({
      where: { settingKey: entry.settingKey },
      create: entry,
      update: {},
    });
  }
  console.log("✅ Platform configuration defaults ensured.");

  const school = await prisma.schoolProfile.findFirst({
    orderBy: { id: "asc" },
  });

  if (!school) {
    await prisma.schoolProfile.create({
      data: {
        schoolName: "DIS-SMS School",
        schoolCode: "DIS-SMS",
        country: "Ghana",
        motto: "Excellence in Education",
      },
    });
    console.log("✅ Default school profile created.");
  } else {
    console.log("ℹ️ School profile already exists.");
  }
}

async function seedAdmin() {
  try {
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

    await seedPlatformDefaults();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: "admin@dissms.com",
      },
    });

    if (existingUser) {
      // Replace legacy role-like placeholder name used in early seeds.
      if (
        existingUser.firstName === "System" &&
        existingUser.lastName === "Administrator"
      ) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            firstName: "Admin",
            lastName: "User",
          },
        });
        console.log("✅ Admin display name updated to Admin User.");
      } else {
        console.log("ℹ️ Admin user already exists.");
      }
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
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
