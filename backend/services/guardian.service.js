// services/guardian.service.js

const guardianRepository = require("../repositories/guardian.repository");
const {
    NotFoundError,
    ConflictError,
    BadRequestError,
} = require("../errors");

const GUARDIAN_FIELDS = [
    "firstName",
    "middleName",
    "lastName",
    "gender",
    "dateOfBirth",
    "nationalId",
    "phone",
    "alternatePhone",
    "email",
    "occupation",
    "employer",
    "residentialAddress",
    "digitalAddress",
    "photo",
    "notes",
    "status",
];

const LINK_FIELDS = [
    "relationship",
    "isPrimary",
    "emergencyContact",
    "financialResponsibility",
    "canPickup",
    "remarks",
];

function sanitizeGuardianData(data = {}) {
    const payload = {};

    for (const field of GUARDIAN_FIELDS) {
        if (data[field] === undefined) continue;
        if (data[field] === "") {
            if (
                [
                    "middleName",
                    "nationalId",
                    "alternatePhone",
                    "email",
                    "occupation",
                    "employer",
                    "residentialAddress",
                    "digitalAddress",
                    "photo",
                    "notes",
                    "dateOfBirth",
                ].includes(field)
            ) {
                payload[field] = null;
            }
            continue;
        }
        payload[field] = data[field];
    }

    if (payload.dateOfBirth) {
        payload.dateOfBirth = new Date(payload.dateOfBirth);
    }

    return payload;
}

function sanitizeLinkData(data = {}) {
    const payload = {};

    for (const field of LINK_FIELDS) {
        if (data[field] === undefined) continue;
        if (data[field] === "" && field === "remarks") {
            payload.remarks = null;
            continue;
        }
        payload[field] = data[field];
    }

    if (payload.isPrimary !== undefined) {
        payload.isPrimary = Boolean(payload.isPrimary);
    }
    if (payload.emergencyContact !== undefined) {
        payload.emergencyContact = Boolean(payload.emergencyContact);
    }
    if (payload.financialResponsibility !== undefined) {
        payload.financialResponsibility = Boolean(
            payload.financialResponsibility
        );
    }
    if (payload.canPickup !== undefined) {
        payload.canPickup = Boolean(payload.canPickup);
    }

    return payload;
}

class GuardianService {
    /**
     * Auto-generate next guardian number: GDN-000001
     */
    async generateGuardianNumber() {
        let counter = 1;

        const latest =
            await guardianRepository.findLatestGuardianNumber();

        if (latest?.guardianNumber) {
            const parsed = parseInt(
                latest.guardianNumber.replace(/^GDN-/i, ""),
                10
            );

            if (!Number.isNaN(parsed)) {
                counter = parsed + 1;
            }
        }

        while (true) {
            const guardianNumber = `GDN-${String(counter).padStart(6, "0")}`;
            const exists =
                await guardianRepository.findGuardianByNumber(
                    guardianNumber
                );

            if (!exists) {
                return guardianNumber;
            }

            counter += 1;
        }
    }

    async getGuardians(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();

        return await guardianRepository.findGuardians({
            page,
            limit,
            search,
        });
    }

    async getGuardianById(id) {
        const guardian = await guardianRepository.findGuardianById(id);

        if (!guardian) {
            throw new NotFoundError("Guardian not found.");
        }

        return guardian;
    }

    async getArchivedGuardians() {
        return await guardianRepository.findArchivedGuardians();
    }

    async createGuardian(rawData) {
        const data = sanitizeGuardianData(rawData);

        if (!data.firstName || !data.lastName || !data.gender || !data.phone) {
            throw new BadRequestError(
                "First name, last name, gender, and phone are required."
            );
        }

        const existingPhone =
            await guardianRepository.findGuardianByPhone(data.phone);

        if (existingPhone) {
            throw new ConflictError(
                "A guardian with this phone number already exists."
            );
        }

        if (data.email) {
            const existingEmail =
                await guardianRepository.findGuardianByEmail(data.email);

            if (existingEmail) {
                throw new ConflictError(
                    "A guardian with this email already exists."
                );
            }
        }

        if (data.nationalId) {
            const existingNationalId =
                await guardianRepository.findGuardianByNationalId(
                    data.nationalId
                );

            if (existingNationalId) {
                throw new ConflictError(
                    "A guardian with this national ID already exists."
                );
            }
        }

        data.guardianNumber = await this.generateGuardianNumber();

        return await guardianRepository.createGuardian(data);
    }

    async updateGuardian(id, rawData) {
        const data = sanitizeGuardianData(rawData);
        const guardian = await guardianRepository.findGuardianById(id);

        if (!guardian) {
            throw new NotFoundError("Guardian not found.");
        }

        if (data.phone && data.phone !== guardian.phone) {
            const duplicatePhone =
                await guardianRepository.findGuardianByPhone(data.phone);

            if (duplicatePhone && duplicatePhone.id !== id) {
                throw new ConflictError(
                    "A guardian with this phone number already exists."
                );
            }
        }

        if (data.email && data.email !== guardian.email) {
            const duplicateEmail =
                await guardianRepository.findGuardianByEmail(data.email);

            if (duplicateEmail && duplicateEmail.id !== id) {
                throw new ConflictError(
                    "A guardian with this email already exists."
                );
            }
        }

        if (
            data.nationalId &&
            data.nationalId !== guardian.nationalId
        ) {
            const duplicateNationalId =
                await guardianRepository.findGuardianByNationalId(
                    data.nationalId
                );

            if (
                duplicateNationalId &&
                duplicateNationalId.id !== id
            ) {
                throw new ConflictError(
                    "A guardian with this national ID already exists."
                );
            }
        }

        return await guardianRepository.updateGuardian(id, data);
    }

    async deleteGuardian(id) {
        const guardian = await guardianRepository.findGuardianById(id);

        if (!guardian) {
            throw new NotFoundError("Guardian not found.");
        }

        return await guardianRepository.softDeleteGuardian(id);
    }

    async restoreGuardian(id) {
        const guardian =
            await guardianRepository.findArchivedGuardianById(id);

        if (!guardian) {
            throw new NotFoundError("Archived guardian not found.");
        }

        if (guardian.phone) {
            const duplicatePhone =
                await guardianRepository.findGuardianByPhone(
                    guardian.phone
                );

            if (duplicatePhone) {
                throw new ConflictError(
                    "Cannot restore guardian: phone number is already in use."
                );
            }
        }

        if (guardian.email) {
            const duplicateEmail =
                await guardianRepository.findGuardianByEmail(
                    guardian.email
                );

            if (duplicateEmail) {
                throw new ConflictError(
                    "Cannot restore guardian: email is already in use."
                );
            }
        }

        return await guardianRepository.restoreGuardian(id);
    }

    async linkGuardianToStudent(studentId, rawData) {
        const guardianId = Number(rawData.guardianId);
        const linkData = sanitizeLinkData(rawData);

        if (!guardianId || Number.isNaN(guardianId)) {
            throw new BadRequestError("Guardian ID is required.");
        }

        if (!linkData.relationship) {
            throw new BadRequestError("Relationship is required.");
        }

        const student =
            await guardianRepository.findStudentById(studentId);

        if (!student) {
            throw new NotFoundError("Student not found.");
        }

        const guardian =
            await guardianRepository.findGuardianById(guardianId);

        if (!guardian) {
            throw new NotFoundError("Guardian not found.");
        }

        const existingLink =
            await guardianRepository.findStudentGuardian(
                studentId,
                guardianId
            );

        if (existingLink) {
            throw new ConflictError(
                "This guardian is already linked to the student."
            );
        }

        return await guardianRepository.linkStudentGuardian({
            studentId,
            guardianId,
            relationship: linkData.relationship,
            isPrimary: linkData.isPrimary ?? false,
            emergencyContact: linkData.emergencyContact ?? false,
            financialResponsibility:
                linkData.financialResponsibility ?? false,
            canPickup: linkData.canPickup ?? false,
            remarks: linkData.remarks ?? null,
        });
    }

    async unlinkGuardianFromStudent(studentId, guardianId) {
        const student =
            await guardianRepository.findStudentById(studentId);

        if (!student) {
            throw new NotFoundError("Student not found.");
        }

        const existingLink =
            await guardianRepository.findStudentGuardian(
                studentId,
                guardianId
            );

        if (!existingLink) {
            throw new NotFoundError(
                "Guardian is not linked to this student."
            );
        }

        return await guardianRepository.unlinkStudentGuardian(
            studentId,
            guardianId
        );
    }

    async getGuardiansByStudentId(studentId) {
        const student =
            await guardianRepository.findStudentById(studentId);

        if (!student) {
            throw new NotFoundError("Student not found.");
        }

        return await guardianRepository.findGuardiansByStudentId(
            studentId
        );
    }
}

module.exports = new GuardianService();
