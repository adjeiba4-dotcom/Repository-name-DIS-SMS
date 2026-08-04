import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Academic Year API service — CRUD + archive/restore.
 */

export async function getAcademicYears(params = {}) {
  const response = await api.get(API.ACADEMIC_YEARS.LIST, { params });
  return response.data;
}

export async function getArchivedAcademicYears() {
  const response = await api.get(API.ACADEMIC_YEARS.ARCHIVED);
  return response.data;
}

export async function getAcademicYearById(id) {
  const response = await api.get(API.ACADEMIC_YEARS.DETAIL(id));
  return response.data;
}

export async function createAcademicYear(payload) {
  const response = await api.post(API.ACADEMIC_YEARS.CREATE, payload);
  return response.data;
}

export async function updateAcademicYear(id, payload) {
  const response = await api.put(API.ACADEMIC_YEARS.UPDATE(id), payload);
  return response.data;
}

export async function deleteAcademicYear(id) {
  const response = await api.delete(API.ACADEMIC_YEARS.DELETE(id));
  return response.data;
}

export async function restoreAcademicYear(id, payload = {}) {
  const response = await api.patch(API.ACADEMIC_YEARS.RESTORE(id), payload);
  return response.data;
}
