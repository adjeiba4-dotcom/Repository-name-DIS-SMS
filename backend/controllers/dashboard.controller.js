const dashboardService = require("../services/dashboard.service");

exports.getDashboard = async(req, res) => {
    const dashboard = await dashboardService.getDashboard();

    res.json({
        success: true,
        message: "Dashboard data retrieved successfully.",
        data: dashboard,
    });
};