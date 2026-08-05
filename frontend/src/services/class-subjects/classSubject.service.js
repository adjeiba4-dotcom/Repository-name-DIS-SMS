import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Class Subject Allocation API service — CRUD + archive/restore.
 */

export async function getClassSubjects(params = {}) {
  const response = await api.get(API.CLASS_SUBJECTS.LIST, { params });
  return response.data;
}

export async function getArchivedClassSubjects() {
  const response = await api.get(API.CLASS_SUBJECTS.ARCHIVED);
  return response.data;
}

export async function getClassSubjectById(id) {
  const response = await api.get(API.CLASS_SUBJECTS.DETAIL(id));
  return response.data;
}

export async function createClassSubject(payload) {
  const response = await api.post(API.CLASS_SUBJECTS.CREATE, payload);
  return response.data;
}

export async function updateClassSubject(id, payload) {
  const response = await api.put(API.CLASS_SUBJECTS.UPDATE(id), payload);
  return response.data;
}

export async function deleteClassSubject(id) {
  const response = await api.delete(API.CLASS_SUBJECTS.DELETE(id));
  return response.data;
}

export async function restoreClassSubject(id, payload = {}) {
  const response = await api.patch(API.CLASS_SUBJECTS.RESTORE(id), payload);
  return response.data;
}
