import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Subject API service — CRUD + archive/restore.
 */

export async function getSubjects(params = {}) {
  const response = await api.get(API.SUBJECTS.LIST, { params });
  return response.data;
}

export async function getArchivedSubjects() {
  const response = await api.get(API.SUBJECTS.ARCHIVED);
  return response.data;
}

export async function getSubjectById(id) {
  const response = await api.get(API.SUBJECTS.DETAIL(id));
  return response.data;
}

export async function createSubject(payload) {
  const response = await api.post(API.SUBJECTS.CREATE, payload);
  return response.data;
}

export async function updateSubject(id, payload) {
  const response = await api.put(API.SUBJECTS.UPDATE(id), payload);
  return response.data;
}

export async function deleteSubject(id) {
  const response = await api.delete(API.SUBJECTS.DELETE(id));
  return response.data;
}

export async function restoreSubject(id, payload = {}) {
  const response = await api.patch(API.SUBJECTS.RESTORE(id), payload);
  return response.data;
}
