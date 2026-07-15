const bcrypt = require("bcryptjs");
const authRepository = require("../repositories/auth.repository");

exports.login = async(email, password) => {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new Error("Invalid email or password.");
    }

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
    };
};