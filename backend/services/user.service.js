const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/user.repository");

exports.getUsers = async() => {
    return await userRepository.findAllUsers();
};

exports.getUserById = async(id) => {
    const user = await userRepository.findUserById(id);

    if (!user) {
        throw new Error("User not found.");
    }

    return user;
};

exports.createUser = async(userData) => {
    const existingUser = await userRepository.findUserByEmail(userData.email);

    if (existingUser) {
        throw new Error("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return await userRepository.createUser({
        ...userData,
        password: hashedPassword,
    });
};

exports.updateUser = async(id, userData) => {
    const existingUser = await userRepository.findUserById(id);

    if (!existingUser) {
        throw new Error("User not found.");
    }

    if (
        userData.email &&
        userData.email !== existingUser.email
    ) {
        const emailExists = await userRepository.findUserByEmail(userData.email);

        if (emailExists) {
            throw new Error("Email already exists.");
        }
    }

    if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
    } else {
        delete userData.password;
    }

    return await userRepository.updateUser(id, userData);
};
exports.deleteUser = async(id) => {
    const existingUser = await userRepository.findUserById(id);

    if (!existingUser) {
        throw new Error("User not found.");
    }

    await userRepository.deleteUser(id);

    return {
        id: Number(id),
    };
};