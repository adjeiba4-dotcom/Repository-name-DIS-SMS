const userService = require("../services/user.service");
const ApiResponse = require("../utils/response");

exports.getUsers = async(req, res, next) => {
    try {
        const users = await userService.getUsers();

        return ApiResponse.success(
            res,
            "Users retrieved successfully.",
            users
        );
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async(req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);

        return ApiResponse.success(
            res,
            "User retrieved successfully.",
            user
        );
    } catch (error) {
        next(error);
    }
};

exports.createUser = async(req, res, next) => {
    try {
        const user = await userService.createUser(req.body);

        return ApiResponse.created(
            res,
            "User created successfully.",
            user
        );
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async(req, res, next) => {
    try {
        const user = await userService.updateUser(
            req.params.id,
            req.body
        );

        return ApiResponse.success(
            res,
            "User updated successfully.",
            user
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async(req, res, next) => {
    try {
        const result = await userService.deleteUser(req.params.id);

        return ApiResponse.success(
            res,
            "User archived successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};