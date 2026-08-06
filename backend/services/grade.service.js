// services/grade.service.js

const gradeRepository = require("../repositories/grade.repository");
const {
    BadRequestError,
    NotFoundError,
    ConflictError,
    BusinessRuleError,
} = require("../errors");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];

function sanitizeScale(data = {}) {
    const payload = {};
    if (data.name !== undefined) {
        payload.name = String(data.name || "").trim();
    }
    if (data.description !== undefined) {
        payload.description =
            data.description === null
                ? null
                : String(data.description).trim() || null;
    }
    if (data.isDefault !== undefined) {
        payload.isDefault = Boolean(data.isDefault);
    }
    if (data.status !== undefined) {
        payload.status = String(data.status).trim().toUpperCase();
    }
    return payload;
}

function sanitizeGrade(data = {}) {
    const payload = {};
    if (data.gradeScaleId !== undefined) {
        payload.gradeScaleId =
            data.gradeScaleId === null || data.gradeScaleId === ""
                ? null
                : parseInt(data.gradeScaleId, 10);
    }
    if (data.grade !== undefined) {
        payload.grade = String(data.grade || "").trim().toUpperCase();
    }
    if (data.description !== undefined) {
        payload.description =
            data.description === null
                ? null
                : String(data.description).trim() || null;
    }
    if (data.minimumScore !== undefined) {
        payload.minimumScore = Number(data.minimumScore);
    }
    if (data.maximumScore !== undefined) {
        payload.maximumScore = Number(data.maximumScore);
    }
    if (data.gradePoint !== undefined) {
        payload.gradePoint =
            data.gradePoint === null || data.gradePoint === ""
                ? null
                : Number(data.gradePoint);
    }
    if (data.remarks !== undefined) {
        payload.remarks =
            data.remarks === null ? null : String(data.remarks).trim() || null;
    }
    if (data.isPass !== undefined) {
        payload.isPass = Boolean(data.isPass);
    }
    if (data.sortOrder !== undefined) {
        payload.sortOrder = parseInt(data.sortOrder, 10) || 0;
    }
    if (data.status !== undefined) {
        payload.status = String(data.status).trim().toUpperCase();
    }
    return payload;
}

function validateStatus(value) {
    if (value && !STATUS_VALUES.includes(value)) {
        throw new BadRequestError("Status must be ACTIVE or INACTIVE.");
    }
}

function assertScoreBand(minimumScore, maximumScore) {
    if (Number.isNaN(minimumScore) || Number.isNaN(maximumScore)) {
        throw new BadRequestError("Score bounds must be valid numbers.");
    }
    if (minimumScore < 0 || maximumScore > 100) {
        throw new BadRequestError("Score bounds must be between 0 and 100.");
    }
    if (minimumScore > maximumScore) {
        throw new BadRequestError(
            "Minimum score cannot be greater than maximum score."
        );
    }
}

function bandsOverlap(aMin, aMax, bMin, bMax) {
    return Number(aMin) <= Number(bMax) && Number(bMin) <= Number(aMax);
}

class GradeService {
    async listScales(query = {}) {
        await gradeRepository.ensureDefaultGradeScale();
        const status = query.status
            ? String(query.status).trim().toUpperCase()
            : null;
        if (status) validateStatus(status);
        return gradeRepository.findScales({
            status,
            search: (query.search || "").trim(),
        });
    }

    async getScaleById(id) {
        const scale = await gradeRepository.findScaleById(id);
        if (!scale) throw new NotFoundError("Grade scale not found.");
        return scale;
    }

    async createScale(rawData = {}) {
        const data = sanitizeScale(rawData);
        if (!data.name) throw new BadRequestError("Grade scale name is required.");
        validateStatus(data.status);

        const duplicate = await gradeRepository.findScaleByName(data.name);
        if (duplicate) {
            throw new ConflictError("A grade scale with this name already exists.");
        }

        return gradeRepository.createScale({
            ...data,
            status: data.status || "ACTIVE",
        });
    }

    async updateScale(id, rawData = {}) {
        await this.getScaleById(id);
        const data = sanitizeScale(rawData);
        validateStatus(data.status);

        if (data.name) {
            const duplicate = await gradeRepository.findScaleByName(data.name, id);
            if (duplicate) {
                throw new ConflictError(
                    "A grade scale with this name already exists."
                );
            }
        }

        return gradeRepository.updateScale(id, data);
    }

    async setDefaultScale(id) {
        const scale = await this.getScaleById(id);
        if (scale.status !== "ACTIVE") {
            throw new BusinessRuleError(
                "Only an active grade scale can be set as default."
            );
        }
        return gradeRepository.setDefaultScale(id);
    }

    async listGrades(query = {}) {
        await gradeRepository.ensureDefaultGradeScale();
        const status = query.status
            ? String(query.status).trim().toUpperCase()
            : "ACTIVE";
        if (status) validateStatus(status);

        return gradeRepository.findGrades({
            gradeScaleId: Number(query.gradeScaleId) || null,
            status,
        });
    }

    async getGradeById(id) {
        const grade = await gradeRepository.findGradeById(id);
        if (!grade) throw new NotFoundError("Grade band not found.");
        return grade;
    }

    async assertNoOverlap(gradeScaleId, minimumScore, maximumScore, excludeId = null) {
        if (!gradeScaleId) return;
        const siblings = await gradeRepository.findGrades({
            gradeScaleId,
            status: "ACTIVE",
        });
        for (const sibling of siblings) {
            if (excludeId && sibling.id === Number(excludeId)) continue;
            if (
                bandsOverlap(
                    minimumScore,
                    maximumScore,
                    sibling.minimumScore,
                    sibling.maximumScore
                )
            ) {
                throw new ConflictError(
                    `Score range overlaps with existing grade band ${sibling.grade} (${sibling.minimumScore}–${sibling.maximumScore}).`
                );
            }
        }
    }

    async createGrade(rawData = {}) {
        const data = sanitizeGrade(rawData);
        if (!data.grade) throw new BadRequestError("Grade letter is required.");
        if (data.minimumScore == null || data.maximumScore == null) {
            throw new BadRequestError("Minimum and maximum scores are required.");
        }
        assertScoreBand(data.minimumScore, data.maximumScore);
        validateStatus(data.status);

        if (data.gradeScaleId) {
            await this.getScaleById(data.gradeScaleId);
        } else {
            const scales = await gradeRepository.findScales({ status: "ACTIVE" });
            const defaultScale =
                scales.find((scale) => scale.isDefault) || scales[0] || null;
            if (defaultScale) data.gradeScaleId = defaultScale.id;
        }

        const duplicate = await gradeRepository.findGradeByLetter(data.grade);
        if (duplicate) {
            throw new ConflictError(
                `Grade letter ${data.grade} already exists. Update the existing band instead.`
            );
        }

        await this.assertNoOverlap(
            data.gradeScaleId,
            data.minimumScore,
            data.maximumScore
        );

        return gradeRepository.createGrade({
            ...data,
            status: data.status || "ACTIVE",
        });
    }

    async updateGrade(id, rawData = {}) {
        const existing = await this.getGradeById(id);
        const data = sanitizeGrade(rawData);
        validateStatus(data.status);

        const next = {
            gradeScaleId:
                data.gradeScaleId !== undefined
                    ? data.gradeScaleId
                    : existing.gradeScaleId,
            grade: data.grade || existing.grade,
            minimumScore:
                data.minimumScore !== undefined
                    ? data.minimumScore
                    : existing.minimumScore,
            maximumScore:
                data.maximumScore !== undefined
                    ? data.maximumScore
                    : existing.maximumScore,
        };

        assertScoreBand(next.minimumScore, next.maximumScore);

        if (data.grade && data.grade !== existing.grade) {
            const duplicate = await gradeRepository.findGradeByLetter(
                data.grade,
                id
            );
            if (duplicate) {
                throw new ConflictError(
                    `Grade letter ${data.grade} already exists.`
                );
            }
        }

        if (next.gradeScaleId) {
            await this.getScaleById(next.gradeScaleId);
        }

        await this.assertNoOverlap(
            next.gradeScaleId,
            next.minimumScore,
            next.maximumScore,
            id
        );

        return gradeRepository.updateGrade(id, data);
    }

    async deactivateGrade(id) {
        await this.getGradeById(id);
        const linked = await gradeRepository.countResultsForGrade(id);
        if (linked > 0) {
            // Soft-deactivate so historical results keep their letter reference.
            return gradeRepository.deactivateGrade(id);
        }
        return gradeRepository.deactivateGrade(id);
    }
}

module.exports = new GradeService();
