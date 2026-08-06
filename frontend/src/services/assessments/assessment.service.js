import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Assessment API service — CRUD, archive/restore, score roster, bulk scores, stats.
 */

export async function getAssessments(params = {}) {
  const response = await api.get(API.ASSESSMENTS.LIST, { params });
  return response.data;
}

export async function getArchivedAssessments(params = {}) {
  const response = await api.get(API.ASSESSMENTS.ARCHIVED, { params });
  return response.data;
}

export async function getAssessmentStats(params = {}) {
  const response = await api.get(API.ASSESSMENTS.STATS, { params });
  return response.data;
}

export async function getAssessmentById(id) {
  const response = await api.get(API.ASSESSMENTS.DETAIL(id));
  return response.data;
}

export async function getAssessmentRoster(id) {
  const response = await api.get(API.ASSESSMENTS.ROSTER(id));
  return response.data;
}

export async function createAssessment(payload) {
  const response = await api.post(API.ASSESSMENTS.CREATE, payload);
  return response.data;
}

export async function updateAssessment(id, payload) {
  const response = await api.put(API.ASSESSMENTS.UPDATE(id), payload);
  return response.data;
}

export async function archiveAssessment(id) {
  const response = await api.delete(API.ASSESSMENTS.DELETE(id));
  return response.data;
}

export async function restoreAssessment(id) {
  const response = await api.patch(API.ASSESSMENTS.RESTORE(id));
  return response.data;
}

export async function bulkAssessmentScores(id, payload) {
  const response = await api.post(API.ASSESSMENTS.SCORES_BULK(id), payload);
  return response.data;
}
