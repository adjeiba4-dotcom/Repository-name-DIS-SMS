import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Teacher API service — uses standard ApiResponse envelopes.
 */
export async function getTeachers() {
  const response = await api.get(API.TEACHERS.LIST);
  return response.data;
}

export async function getArchivedTeachers() {
  const response = await api.get(API.TEACHERS.ARCHIVED);
  return response.data;
}

export async function getTeacherById(id) {
  const response = await api.get(API.TEACHERS.DETAIL(id));
  return response.data;
}

export async function createTeacher(payload) {
  const response = await api.post(API.TEACHERS.CREATE, payload);
  return response.data;
}

export async function updateTeacher(id, payload) {
  const response = await api.put(API.TEACHERS.UPDATE(id), payload);
  return response.data;
}

export async function deleteTeacher(id) {
  const response = await api.delete(API.TEACHERS.DELETE(id));
  return response.data;
}

export async function restoreTeacher(id) {
  const response = await api.patch(API.TEACHERS.RESTORE(id));
  return response.data;
}

export async function searchTeachers(keyword) {
  const response = await api.get(API.TEACHERS.SEARCH, {
    params: { keyword },
  });
  return response.data;
}
