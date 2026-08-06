import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Attendance API service — CRUD, roster take sheet, bulk actions, and summaries.
 */

export async function getAttendance(params = {}) {
  const response = await api.get(API.ATTENDANCE.LIST, { params });
  return response.data;
}

export async function getAttendanceRoster(params = {}) {
  const response = await api.get(API.ATTENDANCE.ROSTER, { params });
  return response.data;
}

export async function getAttendanceStats(params = {}) {
  const response = await api.get(API.ATTENDANCE.STATS, { params });
  return response.data;
}

export async function getAttendanceById(id) {
  const response = await api.get(API.ATTENDANCE.DETAIL(id));
  return response.data;
}

export async function createAttendance(payload) {
  const response = await api.post(API.ATTENDANCE.CREATE, payload);
  return response.data;
}

export async function updateAttendance(id, payload) {
  const response = await api.put(API.ATTENDANCE.UPDATE(id), payload);
  return response.data;
}

export async function deleteAttendance(id) {
  const response = await api.delete(API.ATTENDANCE.DELETE(id));
  return response.data;
}

export async function bulkAttendance(payload) {
  const response = await api.post(API.ATTENDANCE.BULK, payload);
  return response.data;
}
