// repositories/auth.repository.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Find user by email.
 * Excludes soft-deleted users.
 */
exports.findUserByEmail = async(email) => {
    return await prisma.user.findFirst({
        where: {
            email: email.toLowerCase(),
            deletedAt: null,
        },
        include: {
            role: true,
        },
    });
};

/**
 * Find user by ID.
 */
exports.findUserById = async(id) => {
    return await prisma.user.findUnique({
        where: {
            id: parseInt(id, 10),
        },
        include: {
            role: true,
        },
    });
};

/**
 * Update user's last login timestamp.
 */
exports.updateLastLogin = async(id) => {
    return await prisma.user.update({
        where: {
            id: parseInt(id, 10),
        },
        data: {
            lastLogin: new Date(),
        },
    });
};

/**
 * Save refresh token.
 *
 * Reserved for future implementation when a
 * RefreshToken model is introduced.
 */
exports.saveRefreshToken = async(userId, refreshToken) => {
    // Future implementation
    return true;
};

/**
 * Revoke refresh token.
 *
 * Reserved for future implementation.
 */
exports.revokeRefreshToken = async(refreshToken) => {
    // Future implementation
    return true;
};