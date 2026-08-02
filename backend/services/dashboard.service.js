const dashboardRepository = require("../repositories/dashboard.repository");

const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../errors");

/**
 * Get all dashboards
 */
const getDashboards = async() => {
    return await dashboardRepository.findAllDashboards();
};

/**
 * Get dashboard by ID
 */
const getDashboardById = async(id) => {
    const dashboard =
        await dashboardRepository.findDashboardById(
            Number(id)
        );

    if (!dashboard) {
        throw new NotFoundError(
            "Dashboard not found."
        );
    }

    return dashboard;
};

/**
 * Search dashboards
 */
const searchDashboards = async(keyword) => {
    return await dashboardRepository.searchDashboards(
        keyword || ""
    );
};

/**
 * Create dashboard
 */
const createDashboard = async(data) => {

    if (!data.name || data.name.trim() === "") {
        throw new BadRequestError(
            "Dashboard name is required."
        );
    }

    const creator =
        await dashboardRepository.findUserById(
            Number(data.createdBy)
        );

    if (!creator) {
        throw new NotFoundError(
            "Dashboard creator not found."
        );
    }

    const existingDashboard =
        await dashboardRepository.findDashboardByName(
            data.name
        );

    if (existingDashboard) {
        throw new ConflictError(
            "A dashboard with this name already exists."
        );
    }

    if (data.isDefault) {

        const dashboards =
            await dashboardRepository.findAllDashboards();

        const defaultDashboard =
            dashboards.find(
                (dashboard) =>
                dashboard.isDefault === true
            );

        if (defaultDashboard) {
            throw new ConflictError(
                "Only one default dashboard is allowed."
            );
        }
    }

    return await dashboardRepository.createDashboard({
        name: data.name.trim(),
        description: data.description || null,
        isDefault: Boolean(data.isDefault),
        createdBy: Number(data.createdBy),
        status: data.status || "ACTIVE",
    });
};

/**
 * Update dashboard
 */
const updateDashboard = async(
    id,
    data
) => {

    const dashboard =
        await dashboardRepository.findDashboardById(
            Number(id)
        );

    if (!dashboard) {
        throw new NotFoundError(
            "Dashboard not found."
        );
    }

    if (
        data.name &&
        data.name !== dashboard.name
    ) {

        const duplicate =
            await dashboardRepository.findDashboardByName(
                data.name
            );

        if (
            duplicate &&
            duplicate.id !== Number(id)
        ) {
            throw new ConflictError(
                "A dashboard with this name already exists."
            );
        }
    }

    if (data.isDefault === true) {

        const dashboards =
            await dashboardRepository.findAllDashboards();

        const anotherDefault =
            dashboards.find(
                (item) =>
                item.isDefault &&
                item.id !== Number(id)
            );

        if (anotherDefault) {
            throw new ConflictError(
                "Only one default dashboard is allowed."
            );
        }
    }

    return await dashboardRepository.updateDashboard(
        Number(id), {
            ...data,
            createdBy: dashboard.createdBy,
        }
    );
};

/**
 * Delete dashboard
 */
const deleteDashboard = async(
    id
) => {

    const dashboard =
        await dashboardRepository.findDashboardById(
            Number(id)
        );

    if (!dashboard) {
        throw new NotFoundError(
            "Dashboard not found."
        );
    }

    if (dashboard.isDefault) {
        throw new BadRequestError(
            "The default dashboard cannot be deleted."
        );
    }

    return await dashboardRepository.deleteDashboard(
        Number(id)
    );
};

module.exports = {
    getDashboards,
    getDashboardById,
    searchDashboards,
    createDashboard,
    updateDashboard,
    deleteDashboard,
};