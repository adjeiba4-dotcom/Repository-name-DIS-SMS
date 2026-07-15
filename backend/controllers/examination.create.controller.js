const examinationService = require("../services/examination.create.service");

exports.createExamination = async(req, res) => {
    const examination = await examinationService.createExamination(req.body);

    res.status(201).json({
        success: true,
        message: "Examination created successfully.",
        data: examination,
    });
};