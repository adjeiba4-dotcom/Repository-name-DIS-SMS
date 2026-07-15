const feeService = require("../services/fee.service");

exports.getFees = async(req, res) => {
    const fees = await feeService.getFees();

    res.json({
        success: true,
        message: "Fees retrieved successfully.",
        data: fees,
    });
};