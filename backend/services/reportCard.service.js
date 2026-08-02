const reportCardRepository = require("../repositories/reportCard.repository");

const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../errors");

/**
 * Get all report cards
 */
const getReportCards = async() => {
    return await reportCardRepository.findAllReportCards();
};

/**
 * Get report card by ID
 */
const getReportCardById = async(id) => {

    const reportCard =
        await reportCardRepository.findReportCardById(
            Number(id)
        );

    if (!reportCard) {
        throw new NotFoundError(
            "Report card not found."
        );
    }

    return reportCard;
};

/**
 * Search report cards
 */
const searchReportCards = async(keyword) => {
    return await reportCardRepository.searchReportCards(
        keyword || ""
    );
};

/**
 * Calculate Overall Grade
 */
const calculateOverallGrade = (average) => {

    if (average >= 80) return "A";
    if (average >= 70) return "B";
    if (average >= 60) return "C";
    if (average >= 50) return "D";
    if (average >= 40) return "E";

    return "F";
};

/**
 * Create Report Card
 */
const createReportCard = async(data) => {

    data.studentId = Number(data.studentId);
    data.academicYearId = Number(data.academicYearId);
    data.termId = Number(data.termId);

    if (Number.isNaN(data.studentId)) {
        throw new BadRequestError(
            "Invalid student."
        );
    }

    if (Number.isNaN(data.academicYearId)) {
        throw new BadRequestError(
            "Invalid academic year."
        );
    }

    if (Number.isNaN(data.termId)) {
        throw new BadRequestError(
            "Invalid term."
        );
    }

    const student =
        await reportCardRepository.findStudentById(
            data.studentId
        );

    if (!student) {
        throw new NotFoundError(
            "Student not found."
        );
    }

    const academicYear =
        await reportCardRepository.findAcademicYearById(
            data.academicYearId
        );

    if (!academicYear) {
        throw new NotFoundError(
            "Academic year not found."
        );
    }

    const term =
        await reportCardRepository.findTermById(
            data.termId
        );

    if (!term) {
        throw new NotFoundError(
            "Term not found."
        );
    }

    const duplicate =
        await reportCardRepository.findReportCard(
            data.studentId,
            data.academicYearId,
            data.termId
        );

    if (duplicate) {
        throw new ConflictError(
            "Report card already exists for this student."
        );
    }

    const results =
        await reportCardRepository.findStudentResults(
            data.studentId,
            data.academicYearId,
            data.termId
        );

    if (results.length === 0) {
        throw new BadRequestError(
            "The student has no examination results for the selected academic year and term."
        );
    }

    const totalMarks = results.reduce(
        (sum, item) => sum + Number(item.marks),
        0
    );

    const average =
        results.length > 0 ?
        totalMarks / results.length :
        0;

    return await reportCardRepository.createReportCard({
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        termId: data.termId,
        totalMarks,
        averageMarks: Number(
            average.toFixed(2)
        ),
        overallGrade: calculateOverallGrade(average),
        teacherRemarks: data.teacherRemarks || null,
        headmasterRemarks: data.headmasterRemarks || null,
        promoted: data.promoted !== undefined ?
            data.promoted :
            false,
    });
};

/**
 * Update Report Card
 */
const updateReportCard = async(
    id,
    data
) => {

    const reportCard =
        await reportCardRepository.findReportCardById(
            Number(id)
        );

    if (!reportCard) {
        throw new NotFoundError(
            "Report card not found."
        );
    }

    const studentId =
        data.studentId !== undefined ?
        Number(data.studentId) :
        reportCard.studentId;

    const academicYearId =
        data.academicYearId !== undefined ?
        Number(data.academicYearId) :
        reportCard.academicYearId;

    const termId =
        data.termId !== undefined ?
        Number(data.termId) :
        reportCard.termId;

    const student =
        await reportCardRepository.findStudentById(
            studentId
        );

    if (!student) {
        throw new NotFoundError(
            "Student not found."
        );
    }

    const academicYear =
        await reportCardRepository.findAcademicYearById(
            academicYearId
        );

    if (!academicYear) {
        throw new NotFoundError(
            "Academic year not found."
        );
    }

    const term =
        await reportCardRepository.findTermById(
            termId
        );

    if (!term) {
        throw new NotFoundError(
            "Term not found."
        );
    }

    const duplicate =
        await reportCardRepository.findReportCard(
            studentId,
            academicYearId,
            termId
        );

    if (
        duplicate &&
        duplicate.id !== Number(id)
    ) {
        throw new ConflictError(
            "Report card already exists for this student."
        );
    }

    const results =
        await reportCardRepository.findStudentResults(
            studentId,
            academicYearId,
            termId
        );

    if (results.length === 0) {
        throw new BadRequestError(
            "The student has no examination results for the selected academic year and term."
        );
    }

    const totalMarks = results.reduce(
        (sum, item) => sum + Number(item.marks),
        0
    );

    const average =
        results.length > 0 ?
        totalMarks / results.length :
        0;

    return await reportCardRepository.updateReportCard(
        Number(id), {
            studentId,
            academicYearId,
            termId,
            totalMarks,
            averageMarks: Number(
                average.toFixed(2)
            ),
            overallGrade: calculateOverallGrade(average),
            teacherRemarks: data.teacherRemarks,
            headmasterRemarks: data.headmasterRemarks,
            promoted: data.promoted !== undefined ?
                data.promoted :
                reportCard.promoted,
        }
    );
};

/**
 * Delete Report Card
 */
const deleteReportCard = async(
    id
) => {

    const reportCard =
        await reportCardRepository.findReportCardById(
            Number(id)
        );

    if (!reportCard) {
        throw new NotFoundError(
            "Report card not found."
        );
    }

    return await reportCardRepository.deleteReportCard(
        Number(id)
    );
};

module.exports = {
    getReportCards,
    getReportCardById,
    searchReportCards,
    createReportCard,
    updateReportCard,
    deleteReportCard,
};