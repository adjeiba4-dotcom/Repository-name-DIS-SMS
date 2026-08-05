import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Student Enrollment API service — CRUD + archive/restore.
 */

export async function getEnrollments(params = {}) {
  const response = await api.get(API.ENROLLMENTS.LIST, { params });
  return response.data;
}

export async function getArchivedEnrollments() {
  const response = await api.get(API.ENROLLMENTS.ARCHIVED);
  return response.data;
}

export async function getEnrollmentById(id) {
  const response = await api.get(API.ENROLLMENTS.DETAIL(id));
  return response.data;
}

export async function createEnrollment(payload) {
  const response = await api.post(API.ENROLLMENTS.CREATE, payload);
  return response.data;
}

export async function updateEnrollment(id, payload) {
  const response = await api.put(API.ENROLLMENTS.UPDATE(id), payload);
  return response.data;
}

export async function deleteEnrollment(id) {
  const response = await api.delete(API.ENROLLMENTS.DELETE(id));
  return response.data;
}

export async function restoreEnrollment(id, payload = {}) {
  const response = await api.patch(API.ENROLLMENTS.RESTORE(id), payload);
  return response.data;
}
