// controllers/dashboard.controller.js

const dashboardService = require("../services/dashboard.service");
const ApiResponse = require("../utils/response");

const getDashboards = async(req, res, next) => {
    try {
        const dashboards = await dashboardService.getDashboards();

        return ApiResponse.success(
            res,
            "Dashboards retrieved successfully.",
            dashboards
        );
    } catch (error) {
        next(error);
    }
};

const getDashboardById = async(req, res, next) => {
    try {
        const dashboard = await dashboardService.getDashboardById(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Dashboard retrieved successfully.",
            dashboard
        );
    } catch (error) {
        next(error);
    }
};

const searchDashboards = async(req, res, next) => {
    try {
        const dashboards = await dashboardService.searchDashboards(
            req.query.keyword
        );

        return ApiResponse.success(
            res,
            "Dashboards retrieved successfully.",
            dashboards
        );
    } catch (error) {
        next(error);
    }
};

const createDashboard = async(req, res, next) => {
    try {
        const dashboard = await dashboardService.createDashboard(
            req.body
        );

        return ApiResponse.created(
            res,
            "Dashboard created successfully.",
            dashboard
        );
    } catch (error) {
        next(error);
    }
};

const updateDashboard = async(req, res, next) => {
    try {
        const dashboard = await dashboardService.updateDashboard(
            Number(req.params.id),
            req.body
        );

        return ApiResponse.success(
            res,
            "Dashboard updated successfully.",
            dashboard
        );
    } catch (error) {
        next(error);
    }
};

const deleteDashboard = async(req, res, next) => {
    try {
        await dashboardService.deleteDashboard(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Dashboard deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboards,
    getDashboardById,
    searchDashboards,
    createDashboard,
    updateDashboard,
    deleteDashboard,
};