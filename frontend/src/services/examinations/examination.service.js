import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Examination API service — CRUD, archive/restore, score roster, bulk scores, stats.
 */

export async function getExaminations(params = {}) {
  const response = await api.get(API.EXAMINATIONS.LIST, { params });
  return response.data;
}

export async function getArchivedExaminations(params = {}) {
  const response = await api.get(API.EXAMINATIONS.ARCHIVED, { params });
  return response.data;
}

export async function getExaminationStats(params = {}) {
  const response = await api.get(API.EXAMINATIONS.STATS, { params });
  return response.data;
}

export async function getExaminationById(id) {
  const response = await api.get(API.EXAMINATIONS.DETAIL(id));
  return response.data;
}

export async function getExaminationRoster(id) {
  const response = await api.get(API.EXAMINATIONS.ROSTER(id));
  return response.data;
}

export async function createExamination(payload) {
  const response = await api.post(API.EXAMINATIONS.CREATE, payload);
  return response.data;
}

export async function updateExamination(id, payload) {
  const response = await api.put(API.EXAMINATIONS.UPDATE(id), payload);
  return response.data;
}

export async function archiveExamination(id) {
  const response = await api.delete(API.EXAMINATIONS.DELETE(id));
  return response.data;
}

export async function restoreExamination(id) {
  const response = await api.patch(API.EXAMINATIONS.RESTORE(id));
  return response.data;
}

export async function bulkExaminationScores(id, payload) {
  const response = await api.post(API.EXAMINATIONS.SCORES_BULK(id), payload);
  return response.data;
}

export async function lockExamination(id) {
  const response = await api.patch(API.EXAMINATIONS.LOCK(id));
  return response.data;
}

export async function unlockExamination(id) {
  const response = await api.patch(API.EXAMINATIONS.UNLOCK(id));
  return response.data;
}
