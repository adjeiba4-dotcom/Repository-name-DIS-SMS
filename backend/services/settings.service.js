// services/settings.service.js — Global Configuration (SystemSetting)

const settingsRepository = require("../repositories/settings.repository");
const auditService = require("./audit.service");
const {
  DEFAULT_PLATFORM_CONFIG,
} = require("../constants/platformConfig");
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require("../errors");

function parseTypedValue(dataType, raw) {
  if (raw === null || raw === undefined) return null;
  const value = String(raw);

  switch ((dataType || "STRING").toUpperCase()) {
    case "NUMBER": {
      const num = Number(value);
      if (Number.isNaN(num)) {
        throw new BadRequestError("Setting value must be a valid number.");
      }
      return num;
    }
    case "BOOLEAN": {
      const normalized = value.trim().toLowerCase();
      if (!["true", "false", "1", "0"].includes(normalized)) {
        throw new BadRequestError("Setting value must be a boolean.");
      }
      return ["true", "1"].includes(normalized);
    }
    case "JSON": {
      try {
        return JSON.parse(value);
      } catch {
        throw new BadRequestError("Setting value must be valid JSON.");
      }
    }
    default:
      return value;
  }
}

function serializeValue(dataType, value) {
  if (value === null || value === undefined) {
    throw new BadRequestError("Setting value is required.");
  }

  const type = (dataType || "STRING").toUpperCase();
  if (type === "JSON" && typeof value !== "string") {
    return JSON.stringify(value);
  }
  if (type === "BOOLEAN") {
    return String(Boolean(value === true || value === "true" || value === 1 || value === "1"));
  }
  return String(value);
}

function toMap(settings = []) {
  return settings.reduce((acc, row) => {
    acc[row.settingKey] = parseTypedValue(row.dataType, row.settingValue);
    return acc;
  }, {});
}

class SettingsService {
  async ensureDefaults() {
    const created = [];
    for (const entry of DEFAULT_PLATFORM_CONFIG) {
      const existing = await settingsRepository.findSettingByKey(entry.settingKey);
      if (!existing) {
        created.push(await settingsRepository.createSetting(entry));
      }
    }
    return created;
  }

  async getSettings(query = {}) {
    await this.ensureDefaults();
    const category = query.category ? String(query.category).trim().toUpperCase() : null;
    const search = (query.search || query.keyword || "").trim();
    return settingsRepository.findAllSettings({ category, search });
  }

  async getConfigMap(query = {}) {
    const settings = await this.getSettings(query);
    return {
      settings,
      values: toMap(settings),
    };
  }

  async getSettingById(id) {
    const setting = await settingsRepository.findSettingById(Number(id));
    if (!setting) {
      throw new NotFoundError("Setting not found.");
    }
    return setting;
  }

  async getSettingByKey(key) {
    await this.ensureDefaults();
    const setting = await settingsRepository.findSettingByKey(String(key).trim());
    if (!setting) {
      throw new NotFoundError("Setting not found.");
    }
    return setting;
  }

  async createSetting(data, actor = {}) {
    if (!data.settingKey || String(data.settingKey).trim() === "") {
      throw new BadRequestError("Setting key is required.");
    }

    const settingKey = String(data.settingKey).trim();
    const dataType = String(data.dataType || "STRING").trim().toUpperCase();
    const settingValue = serializeValue(dataType, data.settingValue);
    parseTypedValue(dataType, settingValue);

    const existing = await settingsRepository.findSettingByKey(settingKey);
    if (existing) {
      throw new ConflictError("A setting with this key already exists.");
    }

    const created = await settingsRepository.createSetting({
      settingKey,
      settingValue,
      description: data.description || null,
      category: data.category ? String(data.category).trim().toUpperCase() : null,
      dataType,
      isSystem: Boolean(data.isSystem),
    });

    await auditService.record({
      userId: actor.userId,
      module: "GlobalConfig",
      action: "CREATE",
      entityType: "SystemSetting",
      recordId: created.id,
      description: `Created setting ${created.settingKey}`,
      newValues: created,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return created;
  }

  async updateSetting(id, data, actor = {}) {
    const setting = await this.getSettingById(id);
    const dataType = data.dataType
      ? String(data.dataType).trim().toUpperCase()
      : setting.dataType;

    let settingKey = setting.settingKey;
    if (data.settingKey !== undefined) {
      settingKey = String(data.settingKey).trim();
      if (!settingKey) {
        throw new BadRequestError("Setting key cannot be empty.");
      }
      if (settingKey !== setting.settingKey) {
        const duplicate = await settingsRepository.findSettingByKey(settingKey);
        if (duplicate) {
          throw new ConflictError("A setting with this key already exists.");
        }
      }
    }

    const nextValue =
      data.settingValue !== undefined
        ? serializeValue(dataType, data.settingValue)
        : setting.settingValue;
    parseTypedValue(dataType, nextValue);

    const updated = await settingsRepository.updateSetting(Number(id), {
      settingKey,
      settingValue: nextValue,
      description:
        data.description !== undefined ? data.description : setting.description,
      category:
        data.category !== undefined
          ? data.category
            ? String(data.category).trim().toUpperCase()
            : null
          : setting.category,
      dataType,
      isSystem:
        data.isSystem !== undefined ? Boolean(data.isSystem) : setting.isSystem,
    });

    await auditService.record({
      userId: actor.userId,
      module: "GlobalConfig",
      action: "UPDATE",
      entityType: "SystemSetting",
      recordId: updated.id,
      description: `Updated setting ${updated.settingKey}`,
      oldValues: setting,
      newValues: updated,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async upsertMany(entries = [], actor = {}) {
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new BadRequestError("At least one setting entry is required.");
    }

    await this.ensureDefaults();

    const normalized = entries.map((entry) => {
      if (!entry.settingKey) {
        throw new BadRequestError("Each entry requires settingKey.");
      }
      const dataType = String(entry.dataType || "STRING").trim().toUpperCase();
      const settingValue = serializeValue(dataType, entry.settingValue);
      parseTypedValue(dataType, settingValue);
      return {
        settingKey: String(entry.settingKey).trim(),
        settingValue,
        description: entry.description || null,
        category: entry.category
          ? String(entry.category).trim().toUpperCase()
          : null,
        dataType,
        isSystem: entry.isSystem !== undefined ? Boolean(entry.isSystem) : true,
      };
    });

    const updated = await settingsRepository.bulkUpsert(normalized);

    await auditService.record({
      userId: actor.userId,
      module: "GlobalConfig",
      action: "BULK_UPSERT",
      entityType: "SystemSetting",
      description: `Upserted ${updated.length} configuration keys`,
      newValues: { keys: updated.map((row) => row.settingKey) },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updated;
  }

  async deleteSetting(id, actor = {}) {
    const setting = await this.getSettingById(id);
    if (setting.isSystem) {
      throw new ForbiddenError("System configuration keys cannot be deleted.");
    }

    await settingsRepository.deleteSetting(Number(id));

    await auditService.record({
      userId: actor.userId,
      module: "GlobalConfig",
      action: "DELETE",
      entityType: "SystemSetting",
      recordId: setting.id,
      description: `Deleted setting ${setting.settingKey}`,
      oldValues: setting,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return { id: Number(id) };
  }
}

module.exports = new SettingsService();
