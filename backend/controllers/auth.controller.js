// controllers/auth.controller.js

const authService = require("../services/auth.service");
const JwtHelper = require("../helpers/jwt.helper");
const { sanitizeUser } = require("../helpers/user.helper");
const ApiResponse = require("../utils/response");

/**
 * Authenticate user and issue Access & Refresh Tokens.
 */
exports.login = async(req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return ApiResponse.error(
                res,
                "Email and password are required.",
                400
            );
        }

        const user = await authService.login(email, password);

        const accessToken = JwtHelper.generateToken(user);
        const refreshToken = JwtHelper.generateRefreshToken(user);

        // Save refresh token if supported
        if (typeof authService.saveRefreshToken === "function") {
            await authService.saveRefreshToken(user.id, refreshToken);
        }

        return ApiResponse.success(
            res,
            "Login successful.", {
                accessToken,
                refreshToken,
                user: sanitizeUser(user),
            }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Generate a new Access Token using a valid Refresh Token.
 */
exports.refreshToken = async(req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return ApiResponse.error(
                res,
                "Refresh token is required.",
                400
            );
        }

        const decoded = JwtHelper.verifyRefreshToken(refreshToken);

        if (!decoded) {
            return ApiResponse.error(
                res,
                "Invalid or expired refresh token.",
                401
            );
        }

        const user = await authService.getUserById(decoded.id);

        if (!user) {
            return ApiResponse.error(
                res,
                "User associated with token not found.",
                404
            );
        }

        const newAccessToken = JwtHelper.generateToken(user);
        const newRefreshToken = JwtHelper.generateRefreshToken(user);

        return ApiResponse.success(
            res,
            "Token refreshed successfully.", {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user.
 */
exports.logout = async(req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (
            refreshToken &&
            typeof authService.revokeRefreshToken === "function"
        ) {
            await authService.revokeRefreshToken(refreshToken);
        }

        return ApiResponse.success(
            res,
            "Logout successful."
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Return currently authenticated user's profile.
 */
exports.getMe = async(req, res, next) => {
    try {
        const user = await authService.getUserById(req.user.id);

        if (!user) {
            return ApiResponse.error(
                res,
                "User not found.",
                404
            );
        }

        return ApiResponse.success(
            res,
            "User profile retrieved successfully.",
            sanitizeUser(user)
        );
    } catch (error) {
        next(error);
    }
};