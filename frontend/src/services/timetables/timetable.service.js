import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Timetable API service — CRUD + scoped views.
 */

export async function getTimetables(params = {}) {
  const response = await api.get(API.TIMETABLES.LIST, { params });
  return response.data;
}

export async function getTimetableView(params = {}) {
  const response = await api.get(API.TIMETABLES.VIEW, { params });
  return response.data;
}

export async function getTimetableById(id) {
  const response = await api.get(API.TIMETABLES.DETAIL(id));
  return response.data;
}

export async function createTimetable(payload) {
  const response = await api.post(API.TIMETABLES.CREATE, payload);
  return response.data;
}

export async function updateTimetable(id, payload) {
  const response = await api.put(API.TIMETABLES.UPDATE(id), payload);
  return response.data;
}

export async function deleteTimetable(id) {
  const response = await api.delete(API.TIMETABLES.DELETE(id));
  return response.data;
}
