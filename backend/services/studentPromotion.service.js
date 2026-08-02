// services/studentPromotion.service.js

const studentPromotionRepository = require("../repositories/studentPromotion.repository");

const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../errors");

/**
 * Get all promotions
 */
const getStudentPromotions = async() => {
    return await studentPromotionRepository.findAllStudentPromotions();
};

/**
 * Get promotion by ID
 */
const getStudentPromotionById = async(id) => {

    const promotion =
        await studentPromotionRepository.findStudentPromotionById(
            Number(id)
        );

    if (!promotion) {
        throw new NotFoundError(
            "Student promotion not found."
        );
    }

    return promotion;
};

/**
 * Search promotions
 */
const searchStudentPromotions = async(keyword) => {
    return await studentPromotionRepository.searchStudentPromotions(
        keyword || ""
    );
};

/**
 * Create promotion
 */
const createStudentPromotion = async(data) => {

    data.studentId = Number(data.studentId);
    data.fromClassId = Number(data.fromClassId);
    data.toClassId = Number(data.toClassId);
    data.academicYearId = Number(data.academicYearId);
    data.promotedBy = Number(data.promotedBy);

    if (Number.isNaN(data.studentId)) {
        throw new BadRequestError(
            "Invalid student."
        );
    }

    if (Number.isNaN(data.fromClassId)) {
        throw new BadRequestError(
            "Invalid current class."
        );
    }

    if (Number.isNaN(data.toClassId)) {
        throw new BadRequestError(
            "Invalid destination class."
        );
    }

    if (Number.isNaN(data.academicYearId)) {
        throw new BadRequestError(
            "Invalid academic year."
        );
    }

    if (Number.isNaN(data.promotedBy)) {
        throw new BadRequestError(
            "Invalid promoted by user."
        );
    }

    const student =
        await studentPromotionRepository.findStudentById(
            data.studentId
        );

    if (!student) {
        throw new NotFoundError(
            "Student not found."
        );
    }

    const fromClass =
        await studentPromotionRepository.findSchoolClassById(
            data.fromClassId
        );

    if (!fromClass) {
        throw new NotFoundError(
            "Current class not found."
        );
    }

    const toClass =
        await studentPromotionRepository.findSchoolClassById(
            data.toClassId
        );

    if (!toClass) {
        throw new NotFoundError(
            "Destination class not found."
        );
    }

    const academicYear =
        await studentPromotionRepository.findAcademicYearById(
            data.academicYearId
        );

    if (!academicYear) {
        throw new NotFoundError(
            "Academic year not found."
        );
    }

    const promotedByUser =
        await studentPromotionRepository.findUserById(
            data.promotedBy
        );

    if (!promotedByUser) {
        throw new NotFoundError(
            "User not found."
        );
    }

    if (data.fromClassId === data.toClassId) {
        throw new BadRequestError(
            "A student cannot be promoted to the same class."
        );
    }

    const duplicate =
        await studentPromotionRepository.findStudentPromotion(
            data.studentId,
            data.academicYearId
        );

    if (duplicate) {
        throw new ConflictError(
            "This student has already been promoted for the selected academic year."
        );
    }

    return await studentPromotionRepository.createStudentPromotion({
        studentId: data.studentId,
        fromClassId: data.fromClassId,
        toClassId: data.toClassId,
        academicYearId: data.academicYearId,
        promotedBy: data.promotedBy,
        remarks: data.remarks || null,
        promotionDate: data.promotionDate ?
            new Date(data.promotionDate) :
            new Date(),
    });
};

/**
 * Update promotion
 */
const updateStudentPromotion = async(
    id,
    data
) => {

    const promotion =
        await studentPromotionRepository.findStudentPromotionById(
            Number(id)
        );

    if (!promotion) {
        throw new NotFoundError(
            "Student promotion not found."
        );
    }

    return await studentPromotionRepository.updateStudentPromotion(
        Number(id),
        data
    );
};

/**
 * Delete promotion
 */
const deleteStudentPromotion = async(
    id
) => {

    const promotion =
        await studentPromotionRepository.findStudentPromotionById(
            Number(id)
        );

    if (!promotion) {
        throw new NotFoundError(
            "Student promotion not found."
        );
    }

    return await studentPromotionRepository.deleteStudentPromotion(
        Number(id)
    );
};

module.exports = {
    getStudentPromotions,
    getStudentPromotionById,
    searchStudentPromotions,
    createStudentPromotion,
    updateStudentPromotion,
    deleteStudentPromotion,
};