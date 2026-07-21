const bcrypt = require("bcryptjs");
const authRepository = require("../repositories/auth.repository");
const prisma = require("../config/prisma");

exports.login = async(email, password) => {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new Error("Invalid email or password.");
    }

    // Update last login
    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            lastLogin: new Date(),
        },
    });

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: {
            id: user.role.id,
            name: user.role.name,
        },
        status: user.status,
    };
};