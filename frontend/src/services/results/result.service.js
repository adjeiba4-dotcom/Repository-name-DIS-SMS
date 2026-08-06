import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Results Engine API service — generate, verify, publish/lock, reports, analytics.
 */

export async function getResults(params = {}) {
  const response = await api.get(API.RESULTS.LIST, { params });
  return response.data;
}

export async function getArchivedResults(params = {}) {
  const response = await api.get(API.RESULTS.ARCHIVED, { params });
  return response.data;
}

export async function getResultStats(params = {}) {
  const response = await api.get(API.RESULTS.STATS, { params });
  return response.data;
}

export async function getResultWeightings() {
  const response = await api.get(API.RESULTS.WEIGHTINGS);
  return response.data;
}

export async function getResultBroadsheet(params = {}) {
  const response = await api.get(API.RESULTS.BROADSHEET, { params });
  return response.data;
}

export async function getResultMeritList(params = {}) {
  const response = await api.get(API.RESULTS.MERIT_LIST, { params });
  return response.data;
}

export async function getStudentResultProfile(studentId, params = {}) {
  const response = await api.get(API.RESULTS.STUDENT_PROFILE(studentId), {
    params,
  });
  return response.data;
}

export async function getResultById(id) {
  const response = await api.get(API.RESULTS.DETAIL(id));
  return response.data;
}

export async function generateResults(payload) {
  const response = await api.post(API.RESULTS.GENERATE, payload);
  return response.data;
}

export async function createResult(payload) {
  const response = await api.post(API.RESULTS.CREATE, payload);
  return response.data;
}

export async function updateResult(id, payload) {
  const response = await api.put(API.RESULTS.UPDATE(id), payload);
  return response.data;
}

export async function archiveResult(id) {
  const response = await api.delete(API.RESULTS.DELETE(id));
  return response.data;
}

export async function restoreResult(id) {
  const response = await api.patch(API.RESULTS.RESTORE(id));
  return response.data;
}

export async function verifyResults(payload) {
  const response = await api.post(API.RESULTS.VERIFY, payload);
  return response.data;
}

export async function unverifyResults(payload) {
  const response = await api.post(API.RESULTS.UNVERIFY, payload);
  return response.data;
}

export async function publishResults(payload) {
  const response = await api.post(API.RESULTS.PUBLISH, payload);
  return response.data;
}

export async function unpublishResults(payload) {
  const response = await api.post(API.RESULTS.UNPUBLISH, payload);
  return response.data;
}

export async function lockResults(payload) {
  const response = await api.post(API.RESULTS.LOCK, payload);
  return response.data;
}

export async function unlockResults(payload) {
  const response = await api.post(API.RESULTS.UNLOCK, payload);
  return response.data;
}

export async function recalculatePositions(payload) {
  const response = await api.post(API.RESULTS.RECALCULATE, payload);
  return response.data;
}
