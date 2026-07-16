const feeService = require("../services/fee.service");

exports.getFees = async(req, res, next) => {
    try {
        const fees = await feeService.getFees();

        res.status(200).json({
            success: true,
            message: "Fees retrieved successfully.",
            data: fees,
        });
    } catch (error) {
        next(error);
    }
};

exports.getFeeById = async(req, res, next) => {
    try {
        const fee = await feeService.getFeeById(req.params.id);

        res.status(200).json({
            success: true,
            message: "Fee retrieved successfully.",
            data: fee,
        });
    } catch (error) {
        next(error);
    }
};

exports.createFee = async(req, res, next) => {
    try {
        const fee = await feeService.createFee(req.body);

        res.status(201).json({
            success: true,
            message: "Fee created successfully.",
            data: fee,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateFee = async(req, res, next) => {
    try {
        const fee = await feeService.updateFee(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Fee updated successfully.",
            data: fee,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteFee = async(req, res, next) => {
    try {
        const result = await feeService.deleteFee(req.params.id);

        res.status(200).json({
            success: true,
            message: "Fee deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};