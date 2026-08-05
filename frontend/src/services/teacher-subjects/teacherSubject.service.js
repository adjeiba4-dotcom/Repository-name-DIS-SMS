import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Teacher Subject Assignment API service — CRUD + archive/restore.
 */

export async function getTeacherSubjects(params = {}) {
  const response = await api.get(API.TEACHER_SUBJECTS.LIST, { params });
  return response.data;
}

export async function getArchivedTeacherSubjects() {
  const response = await api.get(API.TEACHER_SUBJECTS.ARCHIVED);
  return response.data;
}

export async function getTeacherSubjectById(id) {
  const response = await api.get(API.TEACHER_SUBJECTS.DETAIL(id));
  return response.data;
}

export async function createTeacherSubject(payload) {
  const response = await api.post(API.TEACHER_SUBJECTS.CREATE, payload);
  return response.data;
}

export async function updateTeacherSubject(id, payload) {
  const response = await api.put(API.TEACHER_SUBJECTS.UPDATE(id), payload);
  return response.data;
}

export async function deleteTeacherSubject(id) {
  const response = await api.delete(API.TEACHER_SUBJECTS.DELETE(id));
  return response.data;
}

export async function restoreTeacherSubject(id, payload = {}) {
  const response = await api.patch(API.TEACHER_SUBJECTS.RESTORE(id), payload);
  return response.data;
}
