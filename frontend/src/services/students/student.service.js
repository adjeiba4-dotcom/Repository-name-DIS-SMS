import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Student API service — uses standard ApiResponse envelopes.
 */
export async function getStudents() {
  const response = await api.get(API.STUDENTS.LIST);
  return response.data;
}

export async function getArchivedStudents() {
  const response = await api.get(API.STUDENTS.ARCHIVED);
  return response.data;
}

export async function getStudentById(id) {
  const response = await api.get(API.STUDENTS.DETAIL(id));
  return response.data;
}

export async function createStudent(payload) {
  const response = await api.post(API.STUDENTS.CREATE, payload);
  return response.data;
}

export async function updateStudent(id, payload) {
  const response = await api.put(API.STUDENTS.UPDATE(id), payload);
  return response.data;
}

export async function deleteStudent(id) {
  const response = await api.delete(API.STUDENTS.DELETE(id));
  return response.data;
}

export async function restoreStudent(id) {
  const response = await api.patch(API.STUDENTS.RESTORE(id));
  return response.data;
}

export async function searchStudents(search) {
  const response = await api.get(API.STUDENTS.SEARCH, {
    params: { search },
  });
  return response.data;
}
