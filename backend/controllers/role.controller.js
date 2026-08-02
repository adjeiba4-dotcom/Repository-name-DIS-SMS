// controllers/role.controller.js

const roleService = require("../services/role.service");
const ApiResponse = require("../utils/response");

/**
 * Get all roles.
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
 * Get role by ID.
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
 * Create role.
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
 * Update role.
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
 * Activate role.
 */
exports.activateRole = async(req, res, next) => {
    try {
        const role = await roleService.activateRole(req.params.id);

        return ApiResponse.success(
            res,
            "Role activated successfully.",
            role
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Deactivate role.
 */
exports.deactivateRole = async(req, res, next) => {
    try {
        const role = await roleService.deactivateRole(req.params.id);

        return ApiResponse.success(
            res,
            "Role deactivated successfully.",
            role
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Soft delete role.
 */
exports.deleteRole = async(req, res, next) => {
    try {
        await roleService.deleteRole(req.params.id);

        return ApiResponse.success(
            res,
            "Role deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};