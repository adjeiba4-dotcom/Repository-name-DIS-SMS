// middleware/auth.middleware.js

const JwtHelper = require("../helpers/jwt.helper");
const ApiResponse = require("../utils/response");
const authService = require("../services/auth.service");

/**
 * Authenticate JWT Access Token
 */
exports.authenticate = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return ApiResponse.error(
                res,
                "Access token is required.",
                401
            );
        }

        if (!authHeader.startsWith("Bearer ")) {
            return ApiResponse.error(
                res,
                "Invalid authorization format.",
                401
            );
        }

        const token = authHeader.split(" ")[1];

        const decoded = JwtHelper.verifyToken(token);

        if (!decoded) {
            return ApiResponse.error(
                res,
                "Invalid or expired access token.",
                401
            );
        }

        const user = await authService.getUserById(decoded.id);

        if (!user) {
            return ApiResponse.error(
                res,
                "Authenticated user not found.",
                401
            );
        }

        if (user.status !== "ACTIVE") {
            return ApiResponse.error(
                res,
                "Your account has been disabled.",
                403
            );
        }

        req.user = user;

        next();

    } catch (error) {
        next(error);
    }
};

/**
 * Role-Based Authorization
 *
 * Example:
 * router.get(
 *     "/users",
 *     authenticate,
 *     authorize("Administrator"),
 *     controller.getUsers
 * );
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return ApiResponse.error(
                res,
                "Unauthorized.",
                401
            );
        }

        const roleName = req.user.role?.name;

        if (!roles.includes(roleName)) {
            return ApiResponse.error(
                res,
                "You do not have permission to perform this action.",
                403
            );
        }

        next();
    };
};