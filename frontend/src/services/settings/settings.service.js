import api from "../../api/axios";
import API from "../../constants/api";

export async function getSettings(params = {}) {
  const response = await api.get(API.SETTINGS.LIST, { params });
  return response.data;
}

export async function getConfigMap(params = {}) {
  const response = await api.get(API.SETTINGS.MAP, { params });
  return response.data;
}

export async function upsertSettings(settings) {
  const response = await api.put(API.SETTINGS.BULK, { settings });
  return response.data;
}

export async function updateSetting(id, payload) {
  const response = await api.put(API.SETTINGS.UPDATE(id), payload);
  return response.data;
}
