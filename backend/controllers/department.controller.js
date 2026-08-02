const departmentService = require("../services/department.service");
const ApiResponse = require("../utils/response");

exports.getDepartments = async(req, res, next) => {
    try {
        const departments = await departmentService.getDepartments();

        return ApiResponse.success(
            res,
            "Departments retrieved successfully.",
            departments
        );
    } catch (error) {
        next(error);
    }
};

exports.getDepartmentById = async(req, res, next) => {
    try {
        const department = await departmentService.getDepartmentById(
            req.params.id
        );

        return ApiResponse.success(
            res,
            "Department retrieved successfully.",
            department
        );
    } catch (error) {
        next(error);
    }
};

exports.searchDepartments = async(req, res, next) => {
    try {
        const departments = await departmentService.searchDepartments(
            req.query.keyword
        );

        return ApiResponse.success(
            res,
            "Departments retrieved successfully.",
            departments
        );
    } catch (error) {
        next(error);
    }
};

exports.getArchivedDepartments = async(req, res, next) => {
    try {
        const departments =
            await departmentService.getArchivedDepartments();

        return ApiResponse.success(
            res,
            "Archived departments retrieved successfully.",
            departments
        );
    } catch (error) {
        next(error);
    }
};

exports.createDepartment = async(req, res, next) => {
    try {
        const department = await departmentService.createDepartment(req.body);

        return ApiResponse.created(
            res,
            "Department created successfully.",
            department
        );
    } catch (error) {
        next(error);
    }
};

exports.updateDepartment = async(req, res, next) => {
    try {
        const department = await departmentService.updateDepartment(
            req.params.id,
            req.body
        );

        return ApiResponse.success(
            res,
            "Department updated successfully.",
            department
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteDepartment = async(req, res, next) => {
    try {
        const department = await departmentService.deleteDepartment(
            req.params.id
        );

        return ApiResponse.success(
            res,
            "Department archived successfully.",
            department
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreDepartment = async(req, res, next) => {
    try {
        const department = await departmentService.restoreDepartment(
            req.params.id
        );

        return ApiResponse.success(
            res,
            "Department restored successfully.",
            department
        );
    } catch (error) {
        next(error);
    }
};