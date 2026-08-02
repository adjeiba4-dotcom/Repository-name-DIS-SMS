// repositories/dashboardWidget.repository.js

const prisma = require("../database/db");

const findAllWidgets = async() => {
    return prisma.dashboardWidget.findMany({
        include: {
            dashboard: true,
        },
        orderBy: {
            id: "asc",
        },
    });
};

const findWidgetById = async(id) => {
    return prisma.dashboardWidget.findUnique({
        where: { id },
        include: {
            dashboard: true,
        },
    });
};

const findWidgetsByDashboard = async(dashboardId) => {
    return prisma.dashboardWidget.findMany({
        where: {
            dashboardId,
        },
        orderBy: [
            { positionY: "asc" },
            { positionX: "asc" },
        ],
    });
};

const searchWidgets = async(keyword) => {
    return prisma.dashboardWidget.findMany({
        where: {
            OR: [{
                    title: {
                        contains: keyword,
                    },
                },
                {
                    widgetType: {
                        contains: keyword,
                    },
                },
                {
                    dataSource: {
                        contains: keyword,
                    },
                },
            ],
        },
        include: {
            dashboard: true,
        },
    });
};

const createWidget = async(data) => {
    return prisma.dashboardWidget.create({
        data,
    });
};

const updateWidget = async(id, data) => {
    return prisma.dashboardWidget.update({
        where: { id },
        data,
    });
};

const deleteWidget = async(id) => {
    return prisma.dashboardWidget.delete({
        where: { id },
    });
};

const updateWidgetPosition = async(
    id,
    positionX,
    positionY
) => {
    return prisma.dashboardWidget.update({
        where: { id },
        data: {
            positionX,
            positionY,
        },
    });
};

const updateWidgetSize = async(
    id,
    width,
    height
) => {
    return prisma.dashboardWidget.update({
        where: { id },
        data: {
            width,
            height,
        },
    });
};

module.exports = {
    findAllWidgets,
    findWidgetById,
    findWidgetsByDashboard,
    searchWidgets,
    createWidget,
    updateWidget,
    deleteWidget,
    updateWidgetPosition,
    updateWidgetSize,
};