// services/auth.service.js

const bcrypt = require("bcryptjs");
const authRepository = require("../repositories/auth.repository");

/**
 * Authenticate user credentials.
 */
exports.login = async(email, password) => {
    // Find user by email
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    // Check if account is active
    if (user.status !== "ACTIVE") {
        const error = new Error(
            "Your account has been deactivated. Please contact the administrator."
        );
        error.statusCode = 403;
        throw error;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    // Update last login
    await authRepository.updateLastLogin(user.id);

    // Return fresh user record with updated lastLogin
    return await authRepository.findUserById(user.id);
};

/**
 * Get user by ID.
 */
exports.getUserById = async(id) => {
    return await authRepository.findUserById(id);
};

/**
 * Save refresh token.
 * Ready for future implementation.
 */
exports.saveRefreshToken = async(userId, refreshToken) => {
    return await authRepository.saveRefreshToken(
        userId,
        refreshToken
    );
};

/**
 * Revoke refresh token.
 * Ready for future implementation.
 */
exports.revokeRefreshToken = async(refreshToken) => {
    return await authRepository.revokeRefreshToken(
        refreshToken
    );
};