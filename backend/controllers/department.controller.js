const departmentRepository = require("../repositories/department.repository");

exports.getDepartments = async() => {
    return await departmentRepository.findAllDepartments();
};

exports.getDepartmentById = async(id) => {
    const department = await departmentRepository.findDepartmentById(id);

    if (!department) {
        throw new Error("Department not found.");
    }

    return department;
};

exports.createDepartment = async(departmentData) => {
    const existingDepartment =
        await departmentRepository.findDepartmentByName(
            departmentData.name
        );

    if (existingDepartment) {
        throw new Error("Department already exists.");
    }

    return await departmentRepository.createDepartment(
        departmentData
    );
};

exports.updateDepartment = async(id, departmentData) => {
    const existingDepartment =
        await departmentRepository.findDepartmentById(id);

    if (!existingDepartment) {
        throw new Error("Department not found.");
    }

    if (
        departmentData.name &&
        departmentData.name !== existingDepartment.name
    ) {
        const duplicate =
            await departmentRepository.findDepartmentByName(
                departmentData.name
            );

        if (duplicate) {
            throw new Error("Department already exists.");
        }
    }

    return await departmentRepository.updateDepartment(
        id,
        departmentData
    );
};

exports.deleteDepartment = async(id) => {
    const existingDepartment =
        await departmentRepository.findDepartmentById(id);

    if (!existingDepartment) {
        throw new Error("Department not found.");
    }

    await departmentRepository.deleteDepartment(id);

    return {
        id: Number(id),
    };
};