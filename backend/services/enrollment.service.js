// services/enrollment.service.js

const enrollmentRepository = require("../repositories/enrollment.repository");
const {
    NotFoundError,
    ConflictError,
    BadRequestError,
} = require("../errors");

const ENROLLMENT_FIELDS = [
    "studentId",
    "schoolClassId",
    "academicYearId",
    "termId",
    "enrollmentDate",
    "remarks",
    "status",
];

function sanitizeEnrollmentData(data = {}) {
    const payload = {};

    for (const field of ENROLLMENT_FIELDS) {
        if (data[field] === undefined) continue;

        if (
            field === "studentId" ||
            field === "schoolClassId" ||
            field === "academicYearId" ||
            field === "termId"
        ) {
            if (data[field] === null || data[field] === "") {
                if (field === "termId") {
                    payload[field] = null;
                }
                continue;
            }
            payload[field] = parseInt(data[field], 10);
            continue;
        }

        if (field === "enrollmentDate") {
            if (data[field] === null || data[field] === "") continue;
            payload[field] = new Date(data[field]);
            continue;
        }

        if (typeof data[field] === "string") {
            const trimmed = data[field].trim();
            if (field === "remarks" && trimmed === "") {
                payload[field] = null;
            } else {
                payload[field] = trimmed;
            }
        } else {
            payload[field] = data[field];
        }
    }

    // Accept legacy classId alias from older clients.
    if (
        payload.schoolClassId === undefined &&
        data.classId !== undefined &&
        data.classId !== null &&
        data.classId !== ""
    ) {
        payload.schoolClassId = parseInt(data.classId, 10);
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

function assertValidEnrollmentDate(enrollmentDate) {
    if (enrollmentDate === undefined) return;
    if (
        !(enrollmentDate instanceof Date) ||
        Number.isNaN(enrollmentDate.getTime())
    ) {
        throw new BadRequestError("Enrollment date must be a valid date.");
    }
}

class EnrollmentService {
    async generateEnrollmentNumber() {
        const year = new Date().getFullYear();
        let counter = 1;

        const latest =
            await enrollmentRepository.findLatestEnrollmentNumber(year);

        if (latest?.enrollmentNumber) {
            const parsed = parseInt(
                latest.enrollmentNumber.replace(/^ENR-\d+-/, ""),
                10
            );
            if (!Number.isNaN(parsed)) {
                counter = parsed + 1;
            }
        }

        while (true) {
            const enrollmentNumber = `ENR-${year}-${String(counter).padStart(6, "0")}`;
            const exists =
                await enrollmentRepository.findEnrollmentByNumber(
                    enrollmentNumber
                );
            if (!exists) {
                return enrollmentNumber;
            }
            counter += 1;
        }
    }

    async getEnrollments(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();
        const studentId = query.studentId
            ? parseInt(query.studentId, 10)
            : null;
        const schoolClassRaw = query.schoolClassId || query.classId;
        const schoolClassId = schoolClassRaw
            ? parseInt(schoolClassRaw, 10)
            : null;
        const academicYearId = query.academicYearId
            ? parseInt(query.academicYearId, 10)
            : null;
        const termId = query.termId ? parseInt(query.termId, 10) : null;
        const status = query.status
            ? String(query.status).trim().toUpperCase()
            : null;
        const sortBy = (query.sortBy || "enrollmentDate").trim();
        const sortOrder = (query.sortOrder || "desc").trim().toLowerCase();

        if (status) {
            assertValidStatus(status, { allowArchived: false });
        }

        return enrollmentRepository.findEnrollments({
            page,
            limit,
            search,
            studentId:
                studentId && !Number.isNaN(studentId) ? studentId : null,
            schoolClassId:
                schoolClassId && !Number.isNaN(schoolClassId)
                    ? schoolClassId
                    : null,
            academicYearId:
                academicYearId && !Number.isNaN(academicYearId)
                    ? academicYearId
                    : null,
            termId: termId && !Number.isNaN(termId) ? termId : null,
            status: status || null,
            sortBy,
            sortOrder,
        });
    }

    async getEnrollmentById(id) {
        const enrollment =
            await enrollmentRepository.findEnrollmentById(id);

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found.");
        }

        return enrollment;
    }

    async getArchivedEnrollments() {
        return enrollmentRepository.findArchivedEnrollments();
    }

    async assertRelatedEntities(data) {
        let student = null;
        let schoolClass = null;

        if (data.studentId) {
            student = await enrollmentRepository.findStudentById(
                data.studentId
            );
            if (!student) {
                throw new NotFoundError("Student not found.");
            }
        }

        if (data.schoolClassId) {
            schoolClass = await enrollmentRepository.findSchoolClassById(
                data.schoolClassId
            );
            if (!schoolClass) {
                throw new NotFoundError("Class not found.");
            }
        }

        if (data.academicYearId) {
            const year =
                await enrollmentRepository.findAcademicYearById(
                    data.academicYearId
                );
            if (!year) {
                throw new NotFoundError("Academic year not found.");
            }
        }

        if (
            schoolClass &&
            data.academicYearId &&
            schoolClass.academicYearId !== data.academicYearId
        ) {
            throw new BadRequestError(
                "Enrollment academic year must match the selected class academic year."
            );
        }

        if (data.termId) {
            const term = await enrollmentRepository.findTermById(
                data.termId
            );
            if (!term) {
                throw new NotFoundError("Term not found.");
            }
            if (
                data.academicYearId &&
                term.academicYearId !== data.academicYearId
            ) {
                throw new BadRequestError(
                    "Term does not belong to the selected academic year."
                );
            }
        }

        return { student, schoolClass };
    }

    async assertNoDuplicate(data, { excludeId = null } = {}) {
        const existing = await enrollmentRepository.findByStudentAndYear({
            studentId: data.studentId,
            academicYearId: data.academicYearId,
            excludeId,
        });

        if (existing) {
            throw new ConflictError(
                existing.deletedAt
                    ? "An archived enrollment for this student and academic year already exists. Restore it instead."
                    : "Student already has an enrollment for this academic year."
            );
        }
    }

    async assertClassCapacity(
        schoolClass,
        { excludeId = null } = {}
    ) {
        if (!schoolClass) return;

        const enrolled = await enrollmentRepository.countActiveByClass(
            schoolClass.id,
            { excludeId }
        );

        if (enrolled >= schoolClass.capacity) {
            throw new ConflictError(
                `Class capacity of ${schoolClass.capacity} has been reached.`
            );
        }
    }

    async createEnrollment(rawData) {
        const data = sanitizeEnrollmentData(rawData);

        if (!data.studentId || !data.schoolClassId || !data.academicYearId) {
            throw new BadRequestError(
                "Student, class, and academic year are required."
            );
        }

        if (data.termId === undefined) {
            data.termId = null;
        }

        if (data.enrollmentDate === undefined) {
            data.enrollmentDate = new Date();
        }
        assertValidEnrollmentDate(data.enrollmentDate);

        data.status = data.status || "ACTIVE";
        assertValidStatus(data.status);

        const { schoolClass } = await this.assertRelatedEntities(data);
        await this.assertNoDuplicate(data);
        await this.assertClassCapacity(schoolClass);

        data.enrollmentNumber = await this.generateEnrollmentNumber();

        const enrollment =
            await enrollmentRepository.createEnrollment(data);

        if (data.status === "ACTIVE") {
            await enrollmentRepository.syncStudentClass(
                data.studentId,
                data.schoolClassId
            );
        }

        return enrollment;
    }

    async updateEnrollment(id, rawData) {
        const enrollment =
            await enrollmentRepository.findEnrollmentById(id);

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found.");
        }

        const data = sanitizeEnrollmentData(rawData);

        if (data.status !== undefined) {
            assertValidStatus(data.status);
        }

        if (data.enrollmentDate !== undefined) {
            assertValidEnrollmentDate(data.enrollmentDate);
        }

        const next = {
            studentId: data.studentId ?? enrollment.studentId,
            schoolClassId: data.schoolClassId ?? enrollment.schoolClassId,
            academicYearId:
                data.academicYearId ?? enrollment.academicYearId,
            termId:
                data.termId !== undefined ? data.termId : enrollment.termId,
        };

        const { schoolClass } = await this.assertRelatedEntities({
            ...data,
            ...next,
        });

        const keysChanged =
            next.studentId !== enrollment.studentId ||
            next.academicYearId !== enrollment.academicYearId;

        if (keysChanged) {
            await this.assertNoDuplicate(next, { excludeId: id });
        }

        const classChanged =
            next.schoolClassId !== enrollment.schoolClassId;

        if (classChanged) {
            await this.assertClassCapacity(schoolClass, {
                excludeId: id,
            });
        }

        const updated = await enrollmentRepository.updateEnrollment(
            id,
            data
        );

        const effectiveStatus = data.status ?? enrollment.status;
        if (effectiveStatus === "ACTIVE") {
            await enrollmentRepository.syncStudentClass(
                next.studentId,
                next.schoolClassId
            );
        }

        return updated;
    }

    async deleteEnrollment(id) {
        const enrollment =
            await enrollmentRepository.findEnrollmentById(id);

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found.");
        }

        return enrollmentRepository.softDeleteEnrollment(id);
    }

    async restoreEnrollment(id, { activate = false } = {}) {
        const enrollment =
            await enrollmentRepository.findEnrollmentByIdIncludingDeleted(
                id
            );

        if (!enrollment) {
            throw new NotFoundError("Enrollment not found.");
        }

        if (!enrollment.deletedAt) {
            throw new BadRequestError("Enrollment is already active.");
        }

        const conflict = await enrollmentRepository.findByStudentAndYear({
            studentId: enrollment.studentId,
            academicYearId: enrollment.academicYearId,
            excludeId: id,
        });

        if (conflict && !conflict.deletedAt) {
            throw new ConflictError(
                "Cannot restore because another active enrollment already exists for this student and academic year."
            );
        }

        const schoolClass =
            await enrollmentRepository.findSchoolClassById(
                enrollment.schoolClassId
            );
        if (!schoolClass) {
            throw new NotFoundError("Class not found.");
        }

        await this.assertClassCapacity(schoolClass, { excludeId: id });

        const status = activate ? "ACTIVE" : "INACTIVE";
        const restored = await enrollmentRepository.restoreEnrollment(id, {
            status,
        });

        if (status === "ACTIVE") {
            await enrollmentRepository.syncStudentClass(
                enrollment.studentId,
                enrollment.schoolClassId
            );
        }

        return restored;
    }
}

module.exports = new EnrollmentService();
