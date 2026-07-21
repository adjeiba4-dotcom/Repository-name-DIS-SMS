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
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        role: {
            connect: {
                id: Number(userData.roleId),
            },
        },
        status: userData.status || "ACTIVE",
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

    const updateData = {};

    if (userData.firstName) updateData.firstName = userData.firstName;
    if (userData.lastName) updateData.lastName = userData.lastName;
    if (userData.email) updateData.email = userData.email;
    if (userData.status) updateData.status = userData.status;

    if (userData.roleId) {
        updateData.role = {
            connect: {
                id: Number(userData.roleId),
            },
        };
    }

    if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, 10);
    }

    return await userRepository.updateUser(id, updateData);
};

exports.deleteUser = async(id) => {
    const existingUser = await userRepository.findUserById(id);

    if (!existingUser) {
        throw new Error("User not found.");
    }

    await userRepository.softDeleteUser(id);

    return {
        id: Number(id),
        message: "User archived successfully.",
    };
};