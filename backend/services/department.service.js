const departmentRepository = require("../repositories/department.repository");

exports.getDepartments = async() => {
    return await departmentRepository.findAllDepartments();
};

exports.getDepartmentById = async(id) => {
    const department = await departmentRepository.findDepartmentById(Number(id));

    if (!department || department.deletedAt) {
        throw new Error("Department not found.");
    }

    return department;
};

exports.searchDepartments = async(keyword) => {
    return await departmentRepository.searchDepartments(keyword);
};

exports.getArchivedDepartments = async() => {
    return await departmentRepository.findArchivedDepartments();
};

exports.createDepartment = async(data) => {

    const existingCode =
        await departmentRepository.findDepartmentByCode(data.code);

    if (existingCode) {
        throw new Error("Department code already exists.");
    }

    const existingName =
        await departmentRepository.findDepartmentByName(data.name);

    if (existingName) {
        throw new Error("Department name already exists.");
    }

    return await departmentRepository.createDepartment(data);
};

exports.updateDepartment = async(id, data) => {

    const department =
        await departmentRepository.findDepartmentById(Number(id));

    if (!department || department.deletedAt) {
        throw new Error("Department not found.");
    }

    if (data.code && data.code !== department.code) {

        const existingCode =
            await departmentRepository.findDepartmentByCode(data.code);

        if (existingCode) {
            throw new Error("Department code already exists.");
        }
    }

    if (data.name && data.name !== department.name) {

        const existingName =
            await departmentRepository.findDepartmentByName(data.name);

        if (existingName) {
            throw new Error("Department name already exists.");
        }
    }

    return await departmentRepository.updateDepartment(
        Number(id),
        data
    );
};

exports.deleteDepartment = async(id) => {

    const department =
        await departmentRepository.findDepartmentById(Number(id));

    if (!department || department.deletedAt) {
        throw new Error("Department not found.");
    }

    return await departmentRepository.softDeleteDepartment(Number(id));
};

exports.restoreDepartment = async(id) => {

    const department =
        await departmentRepository.findDepartmentById(Number(id));

    if (!department) {
        throw new Error("Department not found.");
    }

    if (!department.deletedAt) {
        throw new Error("Department is already active.");
    }

    return await departmentRepository.restoreDepartment(Number(id));
};