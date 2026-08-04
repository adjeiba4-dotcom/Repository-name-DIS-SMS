import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Term API service — CRUD + archive/restore/activate.
 */

export async function getTerms(params = {}) {
  const response = await api.get(API.TERMS.LIST, { params });
  return response.data;
}

export async function getArchivedTerms() {
  const response = await api.get(API.TERMS.ARCHIVED);
  return response.data;
}

export async function getTermById(id) {
  const response = await api.get(API.TERMS.DETAIL(id));
  return response.data;
}

export async function createTerm(payload) {
  const response = await api.post(API.TERMS.CREATE, payload);
  return response.data;
}

export async function updateTerm(id, payload) {
  const response = await api.put(API.TERMS.UPDATE(id), payload);
  return response.data;
}

export async function activateTerm(id) {
  const response = await api.patch(API.TERMS.ACTIVATE(id));
  return response.data;
}

export async function deleteTerm(id) {
  const response = await api.delete(API.TERMS.DELETE(id));
  return response.data;
}

export async function restoreTerm(id, payload = {}) {
  const response = await api.patch(API.TERMS.RESTORE(id), payload);
  return response.data;
}
