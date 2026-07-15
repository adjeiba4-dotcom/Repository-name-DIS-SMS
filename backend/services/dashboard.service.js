const dashboardRepository = require("../repositories/dashboard.repository");

exports.getDashboard = async() => {
    return await dashboardRepository.getDashboardStatistics();
};