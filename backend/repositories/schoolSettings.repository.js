// repositories/schoolSettings.repository.js

const prisma = require("../database/db");

const schoolSelect = {
  id: true,
  schoolName: true,
  schoolCode: true,
  motto: true,
  address: true,
  city: true,
  region: true,
  country: true,
  postalCode: true,
  phone: true,
  email: true,
  website: true,
  logoUrl: true,
  stampUrl: true,
  establishedYear: true,
  accreditationInfo: true,
  createdAt: true,
  updatedAt: true,
};

class SchoolSettingsRepository {
  async findCurrent() {
    return prisma.schoolProfile.findFirst({
      orderBy: { id: "asc" },
      select: schoolSelect,
    });
  }

  async findById(id) {
    return prisma.schoolProfile.findUnique({
      where: { id: Number(id) },
      select: schoolSelect,
    });
  }

  async findByCode(schoolCode) {
    return prisma.schoolProfile.findUnique({
      where: { schoolCode },
      select: schoolSelect,
    });
  }

  async create(data) {
    return prisma.schoolProfile.create({
      data,
      select: schoolSelect,
    });
  }

  async update(id, data) {
    return prisma.schoolProfile.update({
      where: { id: Number(id) },
      data,
      select: schoolSelect,
    });
  }
}

module.exports = new SchoolSettingsRepository();
