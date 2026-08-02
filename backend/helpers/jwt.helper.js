// helpers/jwt.helper.js

const jwt = require("jsonwebtoken");

/**
 * JWT Helper Class
 * Handles generation and verification of Access & Refresh Tokens.
 */
class JwtHelper {
    /**
     * Generate Access Token
     */
    static generateToken(user) {
        return jwt.sign({
                id: user.id,
                email: user.email,
                roleId: user.roleId,
                role: user.role?.name,
            },
            process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            }
        );
    }

    /**
     * Verify Access Token
     */
    static verifyToken(token) {
        try {
            return jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate Refresh Token
     */
    static generateRefreshToken(user) {
        return jwt.sign({
                id: user.id,
            },
            process.env.JWT_REFRESH_SECRET, {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            }
        );
    }

    /**
     * Verify Refresh Token
     */
    static verifyRefreshToken(token) {
        try {
            return jwt.verify(
                token,
                process.env.JWT_REFRESH_SECRET
            );
        } catch (error) {
            return null;
        }
    }
}

module.exports = JwtHelper;