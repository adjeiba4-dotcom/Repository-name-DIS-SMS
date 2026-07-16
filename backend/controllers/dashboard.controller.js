const dashboardService = require("../services/dashboard.service");

exports.getDashboardStatistics = async(req, res, next) => {
    try {
        const statistics =
            await dashboardService.getDashboardStatistics();

        res.status(200).json({
            success: true,
            message: "Dashboard statistics retrieved successfully.",
            data: statistics,
        });
    } catch (error) {
        next(error);
    }
};