import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Guardian API service — used when registering or updating a student.
 */
export async function getGuardians() {
  const response = await api.get(API.GUARDIANS.LIST);
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
