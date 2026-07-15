const resultService = require("../services/result.service");

exports.getResults = async(req, res) => {
    const results = await resultService.getResults();

    res.json({
        success: true,
        message: "Results retrieved successfully.",
        data: results,
    });
};