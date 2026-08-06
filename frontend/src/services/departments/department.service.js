import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Department API service — CRUD + archive/restore + search.
 * Response shape matches other services: axios body (ApiResponse).
 */

export async function getDepartments() {
  const response = await api.get(API.DEPARTMENTS.LIST);
  return response.data;
}

export async function searchDepartments(keyword) {
  const response = await api.get(API.DEPARTMENTS.SEARCH, {
    params: { keyword },
  });
  return response.data;
}

export async function getArchivedDepartments() {
  const response = await api.get(API.DEPARTMENTS.ARCHIVED);
  return response.data;
}

export async function getDepartmentById(id) {
  const response = await api.get(API.DEPARTMENTS.DETAIL(id));
  return response.data;
}

export async function createDepartment(payload) {
  const response = await api.post(API.DEPARTMENTS.CREATE, payload);
  return response.data;
}

export async function updateDepartment(id, payload) {
  const response = await api.put(API.DEPARTMENTS.UPDATE(id), payload);
  return response.data;
}

export async function deleteDepartment(id) {
  const response = await api.delete(API.DEPARTMENTS.DELETE(id));
  return response.data;
}

export async function restoreDepartment(id, payload = {}) {
  const response = await api.patch(API.DEPARTMENTS.RESTORE(id), payload);
  return response.data;
}
