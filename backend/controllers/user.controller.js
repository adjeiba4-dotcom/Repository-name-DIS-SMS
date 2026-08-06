// controllers/user.controller.js

const userService = require("../services/user.service");
const { sanitizeUser } = require("../helpers/user.helper");
const ApiResponse = require("../utils/response");

/**
 * Get all users.
 */
exports.getUsers = async(req, res, next) => {
    try {
        const users = await userService.getUsers();

        return ApiResponse.success(
            res,
            "Users retrieved successfully.",
            users.map(sanitizeUser)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by ID.
 */
exports.getUserById = async(req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);

        return ApiResponse.success(
            res,
            "User retrieved successfully.",
            sanitizeUser(user)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new user.
 */
exports.createUser = async(req, res, next) => {
    try {
        const user = await userService.createUser(req.body);

        return ApiResponse.created(
            res,
            "User created successfully.",
            sanitizeUser(user)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update user.
 */
exports.updateUser = async(req, res, next) => {
    try {
        const user = await userService.updateUser(
            req.params.id,
            req.body
        );

        return ApiResponse.success(
            res,
            "User updated successfully.",
            sanitizeUser(user)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Activate user.
 */
exports.activateUser = async(req, res, next) => {
    try {
        const user = await userService.activateUser(req.params.id);

        return ApiResponse.success(
            res,
            "User activated successfully.",
            sanitizeUser(user)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Deactivate user.
 */
exports.deactivateUser = async(req, res, next) => {
    try {
        const user = await userService.deactivateUser(req.params.id);

        return ApiResponse.success(
            res,
            "User deactivated successfully.",
            sanitizeUser(user)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Soft delete user.
 */
exports.deleteUser = async(req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);

        return ApiResponse.success(
            res,
            "User deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Change user password.
 */
exports.changePassword = async(req, res, next) => {
    try {
        const { password } = req.body;

        await userService.changePassword(
            req.params.id,
            password
        );

        return ApiResponse.success(
            res,
            "Password changed successfully."
        );
    } catch (error) {
        next(error);
    }
};