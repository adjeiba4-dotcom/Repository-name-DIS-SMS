const userService = require("../services/user.service");

exports.getUsers = async(req, res, next) => {
    try {
        const users = await userService.getUsers();

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully.",
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async(req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);

        res.status(200).json({
            success: true,
            message: "User retrieved successfully.",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

exports.createUser = async(req, res, next) => {
    try {
        const user = await userService.createUser(req.body);

        res.status(201).json({
            success: true,
            message: "User created successfully.",
            data: user,
        });
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

        res.status(200).json({
            success: true,
            message: "User updated successfully.",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async(req, res, next) => {
    try {
        const result = await userService.deleteUser(req.params.id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};