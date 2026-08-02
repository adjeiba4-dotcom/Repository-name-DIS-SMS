// services/role.service.js

const roleRepository = require("../repositories/role.repository");

exports.getRoles = async() => {
    return await roleRepository.findAll();
};

exports.getRoleById = async(id) => {
    const role = await roleRepository.findById(id);

    if (!role) {
        const error = new Error("Role not found.");
        error.statusCode = 404;
        throw error;
    }

    return role;
};

exports.createRole = async(data) => {
    const existingRole = await roleRepository.findByName(data.name);

    if (existingRole) {
        const error = new Error("Role already exists.");
        error.statusCode = 409;
        throw error;
    }

    return await roleRepository.create(data);
};

exports.updateRole = async(id, data) => {
    const role = await roleRepository.findById(id);

    if (!role) {
        const error = new Error("Role not found.");
        error.statusCode = 404;
        throw error;
    }

    if (data.name) {
        const existingRole = await roleRepository.findByName(data.name);

        if (existingRole && existingRole.id !== parseInt(id, 10)) {
            const error = new Error("Role already exists.");
            error.statusCode = 409;
            throw error;
        }
    }

    return await roleRepository.update(id, data);
};

exports.activateRole = async(id) => {
    return await roleRepository.activate(id);
};

exports.deactivateRole = async(id) => {
    return await roleRepository.deactivate(id);
};

exports.deleteRole = async(id) => {
    return await roleRepository.softDelete(id);
};