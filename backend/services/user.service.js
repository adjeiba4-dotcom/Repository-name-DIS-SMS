// services/user.service.js

const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/user.repository");

/**
 * Get all users.
 */
exports.getUsers = async() => {
    return await userRepository.findAll();
};

/**
 * Get user by ID.
 */
exports.getUserById = async(id) => {
    const user = await userRepository.findById(id);

    if (!user || user.deletedAt) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

/**
 * Create a new user.
 */
exports.createUser = async(data) => {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
        const error = new Error("Email address is already in use.");
        error.statusCode = 409;
        throw error;
    }

    // Hash password
    data.password = await bcrypt.hash(data.password, 10);

    return await userRepository.create(data);
};

/**
 * Update user.
 */
exports.updateUser = async(id, data) => {
    const existingUser = await userRepository.findById(id);

    if (!existingUser || existingUser.deletedAt) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    // Prevent password updates here
    delete data.password;

    return await userRepository.update(id, data);
};

/**
 * Activate user.
 */
exports.activateUser = async(id) => {
    const user = await userRepository.findById(id);

    if (!user || user.deletedAt) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    return await userRepository.activate(id);
};

/**
 * Deactivate user.
 */
exports.deactivateUser = async(id) => {
    const user = await userRepository.findById(id);

    if (!user || user.deletedAt) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    return await userRepository.deactivate(id);
};

/**
 * Soft delete user.
 */
exports.deleteUser = async(id) => {
    const user = await userRepository.findById(id);

    if (!user || user.deletedAt) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    return await userRepository.softDelete(id);
};

/**
 * Change user password.
 */
exports.changePassword = async(id, newPassword) => {
    const user = await userRepository.findById(id);

    if (!user || user.deletedAt) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return await userRepository.updatePassword(id, hashedPassword);
};