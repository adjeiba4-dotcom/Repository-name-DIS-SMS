import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Class API service — CRUD + archive/restore.
 */

export async function getClasses(params = {}) {
  const response = await api.get(API.CLASSES.LIST, { params });
  return response.data;
}

export async function getArchivedClasses() {
  const response = await api.get(API.CLASSES.ARCHIVED);
  return response.data;
}

export async function getClassById(id) {
  const response = await api.get(API.CLASSES.DETAIL(id));
  return response.data;
}

export async function createClass(payload) {
  const response = await api.post(API.CLASSES.CREATE, payload);
  return response.data;
}

export async function updateClass(id, payload) {
  const response = await api.put(API.CLASSES.UPDATE(id), payload);
  return response.data;
}

export async function deleteClass(id) {
  const response = await api.delete(API.CLASSES.DELETE(id));
  return response.data;
}

export async function restoreClass(id, payload = {}) {
  const response = await api.patch(API.CLASSES.RESTORE(id), payload);
  return response.data;
}
