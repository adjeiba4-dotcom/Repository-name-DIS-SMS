// services/term.service.js

const termRepository = require("../repositories/term.repository");

class TermService {
    async getTerms() {
        return await termRepository.findAllTerms();
    }

    async getTermById(id) {
        const term = await termRepository.findTermById(id);

        if (!term) {
            throw new Error("Term not found.");
        }

        return term;
    }

    async searchTerms(search) {
        return await termRepository.searchTerms(search);
    }

    async getArchivedTerms() {
        return await termRepository.findArchivedTerms();
    }

    async createTerm(data) {
        // Verify Academic Year exists
        const academicYear = await termRepository.findAcademicYearById(
            data.academicYearId
        );

        if (!academicYear) {
            throw new Error("Academic year not found.");
        }

        // Validate dates
        if (new Date(data.startDate) >= new Date(data.endDate)) {
            throw new Error("Start date must be earlier than end date.");
        }

        // Prevent duplicate term names within same academic year
        const existingTerm = await termRepository.findTermByName(
            data.academicYearId,
            data.name
        );

        if (existingTerm) {
            throw new Error(
                "A term with this name already exists for the selected academic year."
            );
        }

        // Ensure only one current term
        if (data.isCurrent === true) {
            await termRepository.clearCurrentTerm();
        }

        return await termRepository.createTerm(data);
    }

    async updateTerm(id, data) {
        const existingTerm = await termRepository.findTermById(id);

        if (!existingTerm) {
            throw new Error("Term not found.");
        }

        // Verify Academic Year exists if changed
        if (data.academicYearId) {
            const academicYear =
                await termRepository.findAcademicYearById(
                    data.academicYearId
                );

            if (!academicYear) {
                throw new Error("Academic year not found.");
            }
        }

        // Validate dates
        if (
            data.startDate &&
            data.endDate &&
            new Date(data.startDate) >= new Date(data.endDate)
        ) {
            throw new Error("Start date must be earlier than end date.");
        }

        // Check duplicate name within same academic year
        if (data.name || data.academicYearId) {
            const academicYearId =
                data.academicYearId || existingTerm.academicYearId;

            const termName =
                data.name || existingTerm.name;

            const duplicate =
                await termRepository.findTermByName(
                    academicYearId,
                    termName
                );

            if (duplicate && duplicate.id !== id) {
                throw new Error(
                    "A term with this name already exists for the selected academic year."
                );
            }
        }

        // Ensure only one current term
        if (data.isCurrent === true) {
            await termRepository.clearCurrentTerm();
        }

        return await termRepository.updateTerm(id, data);
    }

    async deleteTerm(id) {
        const term = await termRepository.findTermById(id);

        if (!term) {
            throw new Error("Term not found.");
        }

        return await termRepository.softDeleteTerm(id);
    }

    async restoreTerm(id) {
        const archivedTerms =
            await termRepository.findArchivedTerms();

        const exists = archivedTerms.find(
            (term) => term.id === id
        );

        if (!exists) {
            throw new Error("Archived term not found.");
        }

        return await termRepository.restoreTerm(id);
    }
}

module.exports = new TermService();