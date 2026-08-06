const feeStructureRepository = require("../repositories/feeStructure.repository");

const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../errors");
const { applyDateFields } = require("../utils/date");

/**
 * Get all fee structures
 */
const getFeeStructures = async() => {
    return await feeStructureRepository.findAllFeeStructures();
};

/**
 * Get fee structure by ID
 */
const getFeeStructureById = async(id) => {

    const feeStructure =
        await feeStructureRepository.findFeeStructureById(
            Number(id)
        );

    if (!feeStructure) {
        throw new NotFoundError(
            "Fee structure not found."
        );
    }

    return feeStructure;
};

/**
 * Search fee structures
 */
const searchFeeStructures = async(keyword) => {
    return await feeStructureRepository.searchFeeStructures(
        keyword || ""
    );
};

/**
 * Create fee structure
 */
const createFeeStructure = async(data) => {

    data.academicYearId = Number(data.academicYearId);
    data.classId = Number(data.classId);
    data.feeTypeId = Number(data.feeTypeId);
    data.amount = Number(data.amount);

    if (Number.isNaN(data.amount)) {
        throw new BadRequestError(
            "Amount must be a valid number."
        );
    }

    if (data.amount <= 0) {
        throw new BadRequestError(
            "Amount must be greater than zero."
        );
    }

    const academicYear =
        await feeStructureRepository.findAcademicYearById(
            data.academicYearId
        );

    if (!academicYear) {
        throw new NotFoundError(
            "Academic year not found."
        );
    }

    const schoolClass =
        await feeStructureRepository.findSchoolClassById(
            data.classId
        );

    if (!schoolClass) {
        throw new NotFoundError(
            "School class not found."
        );
    }

    const feeType =
        await feeStructureRepository.findFeeTypeById(
            data.feeTypeId
        );

    if (!feeType) {
        throw new NotFoundError(
            "Fee type not found."
        );
    }

    const existing =
        await feeStructureRepository.findFeeStructure(
            data.academicYearId,
            data.classId,
            data.feeTypeId
        );

    if (existing) {
        throw new ConflictError(
            "Fee structure already exists for the selected academic year, class and fee type."
        );
    }

    return await feeStructureRepository.createFeeStructure(
        applyDateFields(data, ["dueDate"], { allowNull: true })
    );
};

/**
 * Update fee structure
 */
const updateFeeStructure = async(
    id,
    data
) => {

    const feeStructure =
        await feeStructureRepository.findFeeStructureById(
            Number(id)
        );

    if (!feeStructure) {
        throw new NotFoundError(
            "Fee structure not found."
        );
    }

    const academicYearId =
        data.academicYearId !== undefined ?
        Number(data.academicYearId) :
        feeStructure.academicYearId;

    const classId =
        data.classId !== undefined ?
        Number(data.classId) :
        feeStructure.classId;

    const feeTypeId =
        data.feeTypeId !== undefined ?
        Number(data.feeTypeId) :
        feeStructure.feeTypeId;

    const amount =
        data.amount !== undefined ?
        Number(data.amount) :
        feeStructure.amount;

    if (Number.isNaN(amount)) {
        throw new BadRequestError(
            "Amount must be a valid number."
        );
    }

    if (amount <= 0) {
        throw new BadRequestError(
            "Amount must be greater than zero."
        );
    }

    const academicYear =
        await feeStructureRepository.findAcademicYearById(
            academicYearId
        );

    if (!academicYear) {
        throw new NotFoundError(
            "Academic year not found."
        );
    }

    const schoolClass =
        await feeStructureRepository.findSchoolClassById(
            classId
        );

    if (!schoolClass) {
        throw new NotFoundError(
            "School class not found."
        );
    }

    const feeType =
        await feeStructureRepository.findFeeTypeById(
            feeTypeId
        );

    if (!feeType) {
        throw new NotFoundError(
            "Fee type not found."
        );
    }

    const duplicate =
        await feeStructureRepository.findFeeStructure(
            academicYearId,
            classId,
            feeTypeId
        );

    if (
        duplicate &&
        duplicate.id !== Number(id)
    ) {
        throw new ConflictError(
            "Fee structure already exists for the selected academic year, class and fee type."
        );
    }

    return await feeStructureRepository.updateFeeStructure(
        Number(id),
        applyDateFields(
            {
                ...data,
                academicYearId,
                classId,
                feeTypeId,
                amount,
            },
            ["dueDate"],
            { allowNull: true }
        )
    );
};

/**
 * Delete fee structure
 */
const deleteFeeStructure = async(id) => {

    const feeStructure =
        await feeStructureRepository.findFeeStructureById(
            Number(id)
        );

    if (!feeStructure) {
        throw new NotFoundError(
            "Fee structure not found."
        );
    }

    if (
        feeStructure.invoices &&
        feeStructure.invoices.length > 0
    ) {
        throw new ConflictError(
            "Cannot delete fee structure because it has associated invoices."
        );
    }

    return await feeStructureRepository.deleteFeeStructure(
        Number(id)
    );
};

module.exports = {
    getFeeStructures,
    getFeeStructureById,
    searchFeeStructures,
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
};