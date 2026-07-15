const feeService = require("../services/fee.create.service");

exports.createFee = async(req, res) => {
    const fee = await feeService.createFee(req.body);

    res.status(201).json({
        success: true,
        message: "Fee created successfully.",
        data: fee,
    });
};