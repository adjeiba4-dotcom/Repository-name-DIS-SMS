const jwt = require("jsonwebtoken");

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
    return jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        }
    );
};

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken,
};