// controllers/dashboardWidget.controller.js

const dashboardWidgetService = require("../services/dashboardWidget.service");
const ApiResponse = require("../utils/response");

const getWidgets = async(req, res, next) => {
    try {
        const widgets = await dashboardWidgetService.getWidgets();

        return ApiResponse.success(
            res,
            "Dashboard widgets retrieved successfully.",
            widgets
        );
    } catch (error) {
        next(error);
    }
};

const getWidgetById = async(req, res, next) => {
    try {
        const widget = await dashboardWidgetService.getWidgetById(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Dashboard widget retrieved successfully.",
            widget
        );
    } catch (error) {
        next(error);
    }
};

const getWidgetsByDashboard = async(req, res, next) => {
    try {
        const widgets =
            await dashboardWidgetService.getWidgetsByDashboard(
                Number(req.params.dashboardId)
            );

        return ApiResponse.success(
            res,
            "Dashboard widgets retrieved successfully.",
            widgets
        );
    } catch (error) {
        next(error);
    }
};

const searchWidgets = async(req, res, next) => {
    try {
        const widgets =
            await dashboardWidgetService.searchWidgets(
                req.query.keyword
            );

        return ApiResponse.success(
            res,
            "Dashboard widgets retrieved successfully.",
            widgets
        );
    } catch (error) {
        next(error);
    }
};

const createWidget = async(req, res, next) => {
    try {
        const widget =
            await dashboardWidgetService.createWidget(
                req.body
            );

        return ApiResponse.created(
            res,
            "Dashboard widget created successfully.",
            widget
        );
    } catch (error) {
        next(error);
    }
};

const updateWidget = async(req, res, next) => {
    try {
        const widget =
            await dashboardWidgetService.updateWidget(
                Number(req.params.id),
                req.body
            );

        return ApiResponse.success(
            res,
            "Dashboard widget updated successfully.",
            widget
        );
    } catch (error) {
        next(error);
    }
};

const updateWidgetPosition = async(
    req,
    res,
    next
) => {
    try {
        const widget =
            await dashboardWidgetService.updateWidgetPosition(
                Number(req.params.id),
                req.body.positionX,
                req.body.positionY
            );

        return ApiResponse.success(
            res,
            "Widget position updated successfully.",
            widget
        );
    } catch (error) {
        next(error);
    }
};

const updateWidgetSize = async(
    req,
    res,
    next
) => {
    try {
        const widget =
            await dashboardWidgetService.updateWidgetSize(
                Number(req.params.id),
                req.body.width,
                req.body.height
            );

        return ApiResponse.success(
            res,
            "Widget size updated successfully.",
            widget
        );
    } catch (error) {
        next(error);
    }
};

const deleteWidget = async(req, res, next) => {
    try {
        await dashboardWidgetService.deleteWidget(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Dashboard widget deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWidgets,
    getWidgetById,
    getWidgetsByDashboard,
    searchWidgets,
    createWidget,
    updateWidget,
    updateWidgetPosition,
    updateWidgetSize,
    deleteWidget,
};