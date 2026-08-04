import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Guardian API service — full CRUD + student relationship helpers.
 * All methods return the standard ApiResponse envelope.
 */

export async function getGuardians(params = {}) {
  const response = await api.get(API.GUARDIANS.LIST, { params });
  return response.data;
}

export async function getArchivedGuardians() {
  const response = await api.get(API.GUARDIANS.ARCHIVED);
  return response.data;
}

export async function getGuardianById(id) {
  const response = await api.get(API.GUARDIANS.DETAIL(id));
  return response.data;
}

export async function createGuardian(payload) {
  const response = await api.post(API.GUARDIANS.CREATE, payload);
  return response.data;
}

export async function updateGuardian(id, payload) {
  const response = await api.put(API.GUARDIANS.UPDATE(id), payload);
  return response.data;
}

export async function deleteGuardian(id) {
  const response = await api.delete(API.GUARDIANS.DELETE(id));
  return response.data;
}

export async function restoreGuardian(id) {
  const response = await api.patch(API.GUARDIANS.RESTORE(id));
  return response.data;
}

export async function getGuardiansByStudentId(studentId) {
  const response = await api.get(API.GUARDIANS.BY_STUDENT(studentId));
  return response.data;
}

export async function linkGuardianToStudent(studentId, payload) {
  const response = await api.post(API.GUARDIANS.LINK(studentId), payload);
  return response.data;
}

export async function unlinkGuardianFromStudent(studentId, guardianId) {
  const response = await api.delete(
    API.GUARDIANS.UNLINK(studentId, guardianId)
  );
  return response.data;
}
