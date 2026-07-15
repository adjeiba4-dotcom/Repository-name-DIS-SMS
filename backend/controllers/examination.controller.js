const examinationService = require("../services/examination.service");

exports.getExaminations = async(req, res) => {
    const examinations = await examinationService.getExaminations();

    res.json({
        success: true,
        message: "Examinations retrieved successfully.",
        data: examinations,
    });
};