const departmentRepository = require("../repositories/department.repository");

exports.createDepartment = async(req, res) => {
    const department = await departmentRepository.createDepartment(req.body);

    res.status(201).json({
        success: true,
        message: "Department created successfully.",
        data: department,
    });
};