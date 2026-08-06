import api from "../../api/axios";
import API from "../../constants/api";

export async function getSchoolSettings() {
  const response = await api.get(API.SCHOOL_SETTINGS.GET);
  return response.data;
}

export async function updateSchoolSettings(payload) {
  const response = await api.put(API.SCHOOL_SETTINGS.UPDATE, payload);
  return response.data;
}
