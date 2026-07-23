const roleRepository = require("../repositories/role.repository");

const getRoles = async() => {
    return await roleRepository.findAllRoles();
};

const getRoleById = async(id) => {
    const role = await roleRepository.findRoleById(id);

    if (!role) {
        throw new Error("Role not found.");
    }

    return role;
};

const createRole = async(roleData) => {
    const existingRole = await roleRepository.findRoleByName(roleData.name);

    if (existingRole) {
        throw new Error("Role already exists.");
    }

    return await roleRepository.createRole({
        name: roleData.name,
        description: roleData.description,
        status: roleData.status || "ACTIVE",
    });
};

const updateRole = async(id, roleData) => {
    const role = await roleRepository.findRoleById(id);

    if (!role) {
        throw new Error("Role not found.");
    }

    if (roleData.name && roleData.name !== role.name) {
        const existingRole = await roleRepository.findRoleByName(roleData.name);

        if (existingRole) {
            throw new Error("Role name already exists.");
        }
    }

    return await roleRepository.updateRole(id, {
        name: roleData.name,
        description: roleData.description,
        status: roleData.status,
    });
};

const deleteRole = async(id) => {
    const role = await roleRepository.findRoleById(id);

    if (!role) {
        throw new Error("Role not found.");
    }

    await roleRepository.softDeleteRole(id);

    return {
        id: Number(id),
        message: "Role archived successfully.",
    };
};

module.exports = {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
};