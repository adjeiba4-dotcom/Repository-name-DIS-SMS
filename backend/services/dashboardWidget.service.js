const dashboardWidgetRepository = require("../repositories/dashboardWidget.repository");
const dashboardRepository = require("../repositories/dashboard.repository");

const {
    BadRequestError,
    NotFoundError,
} = require("../errors");

/**
 * Get all dashboard widgets
 */
const getWidgets = async() => {
    return await dashboardWidgetRepository.findAllWidgets();
};

/**
 * Get widget by ID
 */
const getWidgetById = async(id) => {

    const widget =
        await dashboardWidgetRepository.findWidgetById(
            Number(id)
        );

    if (!widget) {
        throw new NotFoundError(
            "Dashboard widget not found."
        );
    }

    return widget;
};

/**
 * Get widgets by dashboard
 */
const getWidgetsByDashboard = async(
    dashboardId
) => {

    const dashboard =
        await dashboardRepository.findDashboardById(
            Number(dashboardId)
        );

    if (!dashboard) {
        throw new NotFoundError(
            "Dashboard not found."
        );
    }

    return await dashboardWidgetRepository.findWidgetsByDashboard(
        Number(dashboardId)
    );
};

/**
 * Search widgets
 */
const searchWidgets = async(keyword) => {
    return await dashboardWidgetRepository.searchWidgets(
        keyword || ""
    );
};

/**
 * Create widget
 */
const createWidget = async(data) => {

    const dashboard =
        await dashboardRepository.findDashboardById(
            Number(data.dashboardId)
        );

    if (!dashboard) {
        throw new NotFoundError(
            "Dashboard not found."
        );
    }

    if (!data.title || data.title.trim() === "") {
        throw new BadRequestError(
            "Widget title is required."
        );
    }

    if (!data.widgetType) {
        throw new BadRequestError(
            "Widget type is required."
        );
    }

    const width =
        data.width !== undefined ?
        Number(data.width) :
        6;

    const height =
        data.height !== undefined ?
        Number(data.height) :
        4;

    if (width <= 0) {
        throw new BadRequestError(
            "Widget width must be greater than zero."
        );
    }

    if (height <= 0) {
        throw new BadRequestError(
            "Widget height must be greater than zero."
        );
    }

    return await dashboardWidgetRepository.createWidget({
        dashboardId: Number(data.dashboardId),
        title: data.title.trim(),
        widgetType: data.widgetType,
        dataSource: data.dataSource || null,
        positionX: Number(
            data.positionX !== undefined ?
            data.positionX :
            0
        ),

        positionY: Number(
            data.positionY !== undefined ?
            data.positionY :
            0
        ),
        width,
        height,
        configuration: data.configuration || null,
        status: data.status || "ACTIVE",
    });
};

/**
 * Update widget
 */
const updateWidget = async(
    id,
    data
) => {

    const widget =
        await dashboardWidgetRepository.findWidgetById(
            Number(id)
        );

    if (!widget) {
        throw new NotFoundError(
            "Dashboard widget not found."
        );
    }

    if (
        data.width !== undefined &&
        Number(data.width) <= 0
    ) {
        throw new BadRequestError(
            "Widget width must be greater than zero."
        );
    }

    if (
        data.height !== undefined &&
        Number(data.height) <= 0
    ) {
        throw new BadRequestError(
            "Widget height must be greater than zero."
        );
    }

    return await dashboardWidgetRepository.updateWidget(
        Number(id), {
            ...data,
            dashboardId: data.dashboardId !== undefined ?
                Number(data.dashboardId) : widget.dashboardId,
        }
    );
};

/**
 * Update widget position
 */
const updateWidgetPosition = async(
    id,
    positionX,
    positionY
) => {

    const widget =
        await dashboardWidgetRepository.findWidgetById(
            Number(id)
        );

    if (!widget) {
        throw new NotFoundError(
            "Dashboard widget not found."
        );
    }

    return await dashboardWidgetRepository.updateWidgetPosition(
        Number(id),
        Number(positionX),
        Number(positionY)
    );
};

/**
 * Update widget size
 */
const updateWidgetSize = async(
    id,
    width,
    height
) => {

    const widget =
        await dashboardWidgetRepository.findWidgetById(
            Number(id)
        );

    if (!widget) {
        throw new NotFoundError(
            "Dashboard widget not found."
        );
    }

    width = Number(width);
    height = Number(height);

    if (width <= 0) {
        throw new BadRequestError(
            "Widget width must be greater than zero."
        );
    }

    if (height <= 0) {
        throw new BadRequestError(
            "Widget height must be greater than zero."
        );
    }

    return await dashboardWidgetRepository.updateWidgetSize(
        Number(id),
        width,
        height
    );
};

/**
 * Delete widget
 */
const deleteWidget = async(
    id
) => {

    const widget =
        await dashboardWidgetRepository.findWidgetById(
            Number(id)
        );

    if (!widget) {
        throw new NotFoundError(
            "Dashboard widget not found."
        );
    }

    return await dashboardWidgetRepository.deleteWidget(
        Number(id)
    );
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