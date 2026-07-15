const subjectService = require("../services/subject.service");

exports.getSubjects = async(req, res) => {
    const subjects = await subjectService.getSubjects();

    res.json({
        success: true,
        message: "Subjects retrieved successfully.",
        data: subjects,
    });
};