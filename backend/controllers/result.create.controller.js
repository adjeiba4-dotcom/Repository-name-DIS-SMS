const resultService = require("../services/result.create.service");

exports.createResult = async(req, res) => {
    const result = await resultService.createResult(req.body);

    res.status(201).json({
        success: true,
        message: "Result created successfully.",
        data: result,
    });
};