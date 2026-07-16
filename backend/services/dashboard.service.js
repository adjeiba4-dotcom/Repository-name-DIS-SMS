const dashboardRepository = require("../repositories/dashboard.repository");

exports.getDashboardStatistics = async() => {
    return await dashboardRepository.getDashboardStatistics();
};