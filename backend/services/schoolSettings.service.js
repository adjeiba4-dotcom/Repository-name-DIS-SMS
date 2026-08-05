// services/schoolSettings.service.js

const schoolSettingsRepository = require("../repositories/schoolSettings.repository");
const auditService = require("./audit.service");
const { BadRequestError, ConflictError } = require("../errors");

const SCHOOL_FIELDS = [
  "schoolName",
  "schoolCode",
  "motto",
  "address",
  "city",
  "region",
  "country",
  "postalCode",
  "phone",
  "email",
  "website",
  "logoUrl",
  "stampUrl",
  "establishedYear",
  "accreditationInfo",
];

function sanitizeSchoolData(data = {}) {
  const payload = {};

  for (const field of SCHOOL_FIELDS) {
    if (data[field] === undefined) continue;

    if (field === "establishedYear") {
      if (data[field] === null || data[field] === "") {
        payload[field] = null;
        continue;
      }
      const year = parseInt(data[field], 10);
      if (!Number.isInteger(year) || year < 1800 || year > 2200) {
        throw new BadRequestError(
          "Established year must be a valid year between 1800 and 2200."
        );
      }
      payload[field] = year;
      continue;
    }

    if (typeof data[field] === "string") {
      const trimmed = data[field].trim();
      payload[field] = trimmed === "" ? null : trimmed;
    } else {
      payload[field] = data[field];
    }
  }

  return payload;
}

class SchoolSettingsService {
  async getSchoolProfile() {
    const existing = await schoolSettingsRepository.findCurrent();
    if (existing) return existing;

    return schoolSettingsRepository.create({
      schoolName: "DIS-SMS School",
      schoolCode: "DIS-SMS",
      country: "Ghana",
    });
  }

  async updateSchoolProfile(data, actor = {}) {
    const current = await this.getSchoolProfile();
    const payload = sanitizeSchoolData(data);

    if (!payload.schoolName && !current.schoolName) {
      throw new BadRequestError("School name is required.");
    }

    if (payload.schoolCode && payload.schoolCode !== current.schoolCode) {
      const duplicate = await schoolSettingsRepository.findByCode(
        payload.schoolCode
      );
      if (duplicate && duplicate.id !== current.id) {
        throw new ConflictError("A school with this code already exists.");
      }
    }

    const updated = await schoolSettingsRepository.update(current.id, {
      ...payload,
      schoolName: payload.schoolName || current.schoolName,
    });

    await auditService.recordSafe({
      userId: actor.userId,
      module: "SchoolSettings",
      action: "UPDATE",
      entityType: "SchoolProfile",
      recordId: updated.id,
      description: "Updated school profile settings",
      oldValues: current,
      newValues: updated,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return updated;
  }
}

module.exports = new SchoolSettingsService();
