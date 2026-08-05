// repositories/settings.repository.js — SystemSetting / Global Configuration

const prisma = require("../database/db");

const settingSelect = {
  id: true,
  settingKey: true,
  settingValue: true,
  description: true,
  category: true,
  dataType: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
};

class SettingsRepository {
  async findAllSettings({ category, search } = {}) {
    const where = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { settingKey: { contains: search } },
        { settingValue: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return prisma.systemSetting.findMany({
      where,
      select: settingSelect,
      orderBy: [{ category: "asc" }, { settingKey: "asc" }],
    });
  }

  async findSettingById(id) {
    return prisma.systemSetting.findUnique({
      where: { id: Number(id) },
      select: settingSelect,
    });
  }

  async findSettingByKey(settingKey) {
    return prisma.systemSetting.findUnique({
      where: { settingKey },
      select: settingSelect,
    });
  }

  async createSetting(data) {
    return prisma.systemSetting.create({
      data,
      select: settingSelect,
    });
  }

  async updateSetting(id, data) {
    return prisma.systemSetting.update({
      where: { id: Number(id) },
      data,
      select: settingSelect,
    });
  }

  async upsertByKey(settingKey, data) {
    return prisma.systemSetting.upsert({
      where: { settingKey },
      create: { settingKey, ...data },
      update: data,
      select: settingSelect,
    });
  }

  async deleteSetting(id) {
    return prisma.systemSetting.delete({
      where: { id: Number(id) },
      select: settingSelect,
    });
  }

  async bulkUpsert(entries = []) {
    const results = [];
    for (const entry of entries) {
      const { settingKey, ...rest } = entry;
      const row = await this.upsertByKey(settingKey, rest);
      results.push(row);
    }
    return results;
  }
}

module.exports = new SettingsRepository();
