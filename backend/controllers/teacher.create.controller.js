const teacherRepository = require("../repositories/teacher.repository");

exports.createTeacher = async(req, res) => {
    const teacher = await teacherRepository.createTeacher(req.body);

    res.status(201).json({
        success: true,
        message: "Teacher created successfully.",
        data: teacher,
    });
};