const departmentRepository = require("../repositories/department.repository");
const auditService = require("./audit.service");
const {
    ConflictError,
    NotFoundError,
    BadRequestError,
} = require("../errors");

function archivedDuplicateError(field, existing) {
    return new ConflictError(
        `An archived department with this ${field} already exists. Restore it instead.`,
        [
            {
                code: "ARCHIVED_DUPLICATE",
                field,
                archivedId: existing.id,
                departmentCode: existing.code,
                departmentName: existing.name,
            },
        ]
    );
}

function activeDuplicateError(field) {
    return new ConflictError(`Department ${field} already exists.`);
}

function assertUniqueCode(existing, fieldLabel = "code") {
    if (!existing) return;
    if (existing.deletedAt) {
        throw archivedDuplicateError(fieldLabel, existing);
    }
    throw activeDuplicateError(fieldLabel);
}

function assertUniqueName(existing, fieldLabel = "name") {
    if (!existing) return;
    if (existing.deletedAt) {
        throw archivedDuplicateError(fieldLabel, existing);
    }
    throw activeDuplicateError(fieldLabel);
}

/** Slim snapshot for audit metadata (omit relation graphs). */
function toAuditSnapshot(department) {
    if (!department) return null;
    return {
        id: department.id,
        code: department.code,
        name: department.name,
        description: department.description ?? null,
        status: department.status,
        deletedAt: department.deletedAt ?? null,
        createdAt: department.createdAt ?? null,
        updatedAt: department.updatedAt ?? null,
    };
}

async function recordDepartmentAudit({
    actor = {},
    action,
    department,
    oldDepartment = null,
    description,
}) {
    await auditService.recordSafe({
        userId: actor.userId,
        module: "Departments",
        action,
        entityType: "Department",
        recordId: department?.id ?? null,
        description,
        oldValues: toAuditSnapshot(oldDepartment),
        newValues: toAuditSnapshot(department),
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
    });
}

exports.getDepartments = async() => {
    return await departmentRepository.findAllDepartments();
};

exports.getDepartmentById = async(id) => {
    const department = await departmentRepository.findDepartmentById(Number(id));

    if (!department || department.deletedAt) {
        throw new NotFoundError("Department not found.");
    }

    return department;
};

exports.searchDepartments = async(keyword) => {
    return await departmentRepository.searchDepartments(keyword);
};

exports.getArchivedDepartments = async() => {
    return await departmentRepository.findArchivedDepartments();
};

exports.createDepartment = async(data, actor = {}) => {
    const existingCode = await departmentRepository.findDepartmentByCode(
        data.code
    );
    assertUniqueCode(existingCode, "code");

    const existingName = await departmentRepository.findDepartmentByName(
        data.name
    );
    assertUniqueName(existingName, "name");

    const created = await departmentRepository.createDepartment(data);

    await recordDepartmentAudit({
        actor,
        action: "CREATE",
        department: created,
        description: `Created department ${created.code} — ${created.name}`,
    });

    return created;
};

exports.updateDepartment = async(id, data, actor = {}) => {
    const departmentId = Number(id);
    const department =
        await departmentRepository.findDepartmentById(departmentId);

    if (!department || department.deletedAt) {
        throw new NotFoundError("Department not found.");
    }

    if (data.code && data.code !== department.code) {
        const existingCode = await departmentRepository.findDepartmentByCode(
            data.code,
            { excludeId: departmentId }
        );
        assertUniqueCode(existingCode, "code");
    }

    if (data.name && data.name !== department.name) {
        const existingName = await departmentRepository.findDepartmentByName(
            data.name,
            { excludeId: departmentId }
        );
        assertUniqueName(existingName, "name");
    }

    const updated = await departmentRepository.updateDepartment(
        departmentId,
        data
    );

    await recordDepartmentAudit({
        actor,
        action: "UPDATE",
        department: updated,
        oldDepartment: department,
        description: `Updated department ${updated.code} — ${updated.name}`,
    });

    return updated;
};

exports.deleteDepartment = async(id, actor = {}) => {
    const department =
        await departmentRepository.findDepartmentById(Number(id));

    if (!department || department.deletedAt) {
        throw new NotFoundError("Department not found.");
    }

    const archived = await departmentRepository.softDeleteDepartment(
        Number(id)
    );

    await recordDepartmentAudit({
        actor,
        action: "ARCHIVE",
        department: archived,
        oldDepartment: department,
        description: `Archived department ${archived.code} — ${archived.name}`,
    });

    return archived;
};

exports.restoreDepartment = async(id, actor = {}) => {
    const department =
        await departmentRepository.findDepartmentById(Number(id));

    if (!department) {
        throw new NotFoundError("Department not found.");
    }

    if (!department.deletedAt) {
        throw new BadRequestError("Department is already active.");
    }

    const codeConflict = await departmentRepository.findDepartmentByCode(
        department.code,
        { excludeId: department.id }
    );
    if (codeConflict && !codeConflict.deletedAt) {
        throw new ConflictError(
            "Cannot restore because another department already uses this code."
        );
    }

    const nameConflict = await departmentRepository.findDepartmentByName(
        department.name,
        { excludeId: department.id }
    );
    if (nameConflict && !nameConflict.deletedAt) {
        throw new ConflictError(
            "Cannot restore because another department already uses this name."
        );
    }

    const restored = await departmentRepository.restoreDepartment(Number(id));

    await recordDepartmentAudit({
        actor,
        action: "RESTORE",
        department: restored,
        oldDepartment: department,
        description: `Restored department ${restored.code} — ${restored.name}`,
    });

    return restored;
};
