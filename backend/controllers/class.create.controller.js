const classRepository = require("../repositories/class.repository");

exports.createClass = async(req, res) => {
    const newClass = await classRepository.createClass(req.body);

    res.status(201).json({
        success: true,
        message: "Class created successfully.",
        data: newClass,
    });
};