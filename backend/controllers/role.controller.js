const roleService = require("../services/role.service");
const ApiResponse = require("../utils/response");

/**
 * Get all roles
 */
exports.getRoles = async(req, res, next) => {
    try {
        const roles = await roleService.getRoles();

        return ApiResponse.success(
            res,
            "Roles retrieved successfully.",
            roles
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get role by ID
 */
exports.getRoleById = async(req, res, next) => {
    try {
        const role = await roleService.getRoleById(req.params.id);

        return ApiResponse.success(
            res,
            "Role retrieved successfully.",
            role
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create role
 */
exports.createRole = async(req, res, next) => {
    try {
        const role = await roleService.createRole(req.body);

        return ApiResponse.created(
            res,
            "Role created successfully.",
            role
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update role
 */
exports.updateRole = async(req, res, next) => {
    try {
        const role = await roleService.updateRole(
            req.params.id,
            req.body
        );

        return ApiResponse.success(
            res,
            "Role updated successfully.",
            role
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete (Archive) role
 */
exports.deleteRole = async(req, res, next) => {
    try {
        const result = await roleService.deleteRole(req.params.id);

        return ApiResponse.success(
            res,
            "Role archived successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};