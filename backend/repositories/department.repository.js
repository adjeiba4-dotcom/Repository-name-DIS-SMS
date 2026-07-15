const db = require("../database/db");

exports.findAllDepartments = async() => {
    return await db.department.findMany({
        orderBy: {
            name: "asc",
        },
    });
};

exports.findDepartmentById = async(id) => {
    return await db.department.findUnique({
        where: {
            id: Number(id),
        },
    });
};

exports.findDepartmentByName = async(name) => {
    return await db.department.findUnique({
        where: {
            name,
        },
    });
};

exports.createDepartment = async(departmentData) => {
    return await db.department.create({
        data: departmentData,
    });
};

exports.updateDepartment = async(id, departmentData) => {
    return await db.department.update({
        where: {
            id: Number(id),
        },
        data: departmentData,
    });
};

exports.deleteDepartment = async(id) => {
    return await db.department.delete({
        where: {
            id: Number(id),
        },
    });
};