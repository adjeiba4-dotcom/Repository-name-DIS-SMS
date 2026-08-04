// services/class.service.js

const classRepository = require("../repositories/class.repository");
const {
    NotFoundError,
    ConflictError,
    BadRequestError,
} = require("../errors");

const CLASS_FIELDS = [
    "classCode",
    "className",
    "academicYearId",
    "departmentId",
    "classTeacherId",
    "capacity",
    "description",
    "status",
];

function sanitizeClassData(data = {}) {
    const payload = {};

    for (const field of CLASS_FIELDS) {
        if (data[field] === undefined) continue;

        if (
            field === "academicYearId" ||
            field === "departmentId" ||
            field === "classTeacherId" ||
            field === "capacity"
        ) {
            if (data[field] === null || data[field] === "") {
                if (field === "departmentId" || field === "classTeacherId") {
                    payload[field] = null;
                }
                continue;
            }
            payload[field] = parseInt(data[field], 10);
            continue;
        }

        if (typeof data[field] === "string") {
            const trimmed = data[field].trim();
            payload[field] =
                field === "description" && trimmed === "" ? null : trimmed;
        } else {
            payload[field] = data[field];
        }
    }

    return payload;
}

function assertValidStatus(status, { allowArchived = false } = {}) {
    const allowed = allowArchived
        ? ["ACTIVE", "INACTIVE", "ARCHIVED"]
        : ["ACTIVE", "INACTIVE"];

    if (status && !allowed.includes(status)) {
        throw new BadRequestError(
            `Status must be one of: ${allowed.join(", ")}.`
        );
    }
}

function assertValidCapacity(capacity) {
    if (capacity === undefined) return;
    if (!Number.isInteger(capacity) || capacity <= 0) {
        throw new BadRequestError("Capacity must be greater than 0.");
    }
}

class ClassService {
    async getClasses(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();
        const academicYearId = query.academicYearId
            ? parseInt(query.academicYearId, 10)
            : null;
        const departmentId = query.departmentId
            ? parseInt(query.departmentId, 10)
            : null;
        const status = query.status ? String(query.status).trim().toUpperCase() : null;
        const sortBy = (query.sortBy || "className").trim();
        const sortOrder = (query.sortOrder || "asc").trim().toLowerCase();

        if (status) {
            assertValidStatus(status, { allowArchived: false });
        }

        return classRepository.findClasses({
            page,
            limit,
            search,
            academicYearId:
                academicYearId && !Number.isNaN(academicYearId)
                    ? academicYearId
                    : null,
            departmentId:
                departmentId && !Number.isNaN(departmentId)
                    ? departmentId
                    : null,
            status: status || null,
            sortBy,
            sortOrder,
        });
    }

    async getClassById(id) {
        const schoolClass = await classRepository.findClassById(id);

        if (!schoolClass) {
            throw new NotFoundError("Class not found.");
        }

        return schoolClass;
    }

    async getArchivedClasses() {
        return classRepository.findArchivedClasses();
    }

    async createClass(rawData) {
        const data = sanitizeClassData(rawData);

        if (
            !data.classCode ||
            !data.className ||
            !data.academicYearId ||
            data.capacity === undefined
        ) {
            throw new BadRequestError(
                "Class code, class name, academic year, and capacity are required."
            );
        }

        assertValidCapacity(data.capacity);

        data.status = data.status || "ACTIVE";
        assertValidStatus(data.status);

        const academicYear = await classRepository.findAcademicYearById(
            data.academicYearId
        );
        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        if (data.departmentId) {
            const department = await classRepository.findDepartmentById(
                data.departmentId
            );
            if (!department) {
                throw new NotFoundError("Department not found.");
            }
        }

        if (data.classTeacherId) {
            const teacher = await classRepository.findTeacherById(
                data.classTeacherId
            );
            if (!teacher) {
                throw new NotFoundError("Class teacher not found.");
            }
        }

        const existingCode = await classRepository.findClassByCode(
            data.academicYearId,
            data.classCode
        );
        if (existingCode) {
            throw new ConflictError(
                existingCode.deletedAt
                    ? "An archived class with this code already exists for the selected academic year. Restore it instead."
                    : "A class with this code already exists for the selected academic year."
            );
        }

        return classRepository.createClass(data);
    }

    async updateClass(id, rawData) {
        const schoolClass = await classRepository.findClassById(id);

        if (!schoolClass) {
            throw new NotFoundError("Class not found.");
        }

        const data = sanitizeClassData(rawData);

        if (data.status !== undefined) {
            assertValidStatus(data.status);
        }

        if (data.capacity !== undefined) {
            assertValidCapacity(data.capacity);
        }

        const academicYearId = data.academicYearId ?? schoolClass.academicYearId;
        const academicYear = await classRepository.findAcademicYearById(
            academicYearId
        );
        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        if (data.departmentId) {
            const department = await classRepository.findDepartmentById(
                data.departmentId
            );
            if (!department) {
                throw new NotFoundError("Department not found.");
            }
        }

        if (data.classTeacherId) {
            const teacher = await classRepository.findTeacherById(
                data.classTeacherId
            );
            if (!teacher) {
                throw new NotFoundError("Class teacher not found.");
            }
        }

        const nextCode = data.classCode ?? schoolClass.classCode;
        if (
            data.classCode ||
            (data.academicYearId &&
                data.academicYearId !== schoolClass.academicYearId)
        ) {
            const existing = await classRepository.findClassByCode(
                academicYearId,
                nextCode,
                { excludeId: id }
            );
            if (existing) {
                throw new ConflictError(
                    existing.deletedAt
                        ? "An archived class with this code already exists for the selected academic year."
                        : "A class with this code already exists for the selected academic year."
                );
            }
        }

        return classRepository.updateClass(id, data);
    }

    async deleteClass(id) {
        const schoolClass = await classRepository.findClassById(id);

        if (!schoolClass) {
            throw new NotFoundError("Class not found.");
        }

        const enrolled = await classRepository.countEnrolledStudents(id);

        if (enrolled.students > 0 || enrolled.enrollments > 0) {
            throw new ConflictError(
                "Cannot archive class while students are enrolled."
            );
        }

        return classRepository.softDeleteClass(id);
    }

    async restoreClass(id, { activate = false } = {}) {
        const schoolClass =
            await classRepository.findClassByIdIncludingDeleted(id);

        if (!schoolClass) {
            throw new NotFoundError("Class not found.");
        }

        if (!schoolClass.deletedAt) {
            throw new BadRequestError("Class is already active.");
        }

        const existingCode = await classRepository.findClassByCode(
            schoolClass.academicYearId,
            schoolClass.classCode,
            { excludeId: id }
        );
        if (existingCode && !existingCode.deletedAt) {
            throw new ConflictError(
                "Cannot restore because another class already uses this code for the academic year."
            );
        }

        return classRepository.restoreClass(id, {
            status: activate ? "ACTIVE" : "INACTIVE",
        });
    }
}

module.exports = new ClassService();
