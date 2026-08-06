import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Report Cards API service — generate, verify, publish/lock, preview, analytics.
 */

export async function getReportCards(params = {}) {
  const response = await api.get(API.REPORT_CARDS.LIST, { params });
  return response.data;
}

export async function getArchivedReportCards(params = {}) {
  const response = await api.get(API.REPORT_CARDS.ARCHIVED, { params });
  return response.data;
}

export async function getReportCardStats(params = {}) {
  const response = await api.get(API.REPORT_CARDS.STATS, { params });
  return response.data;
}

export async function getReportCardTemplates() {
  const response = await api.get(API.REPORT_CARDS.TEMPLATES);
  return response.data;
}

export async function getReportCardById(id) {
  const response = await api.get(API.REPORT_CARDS.DETAIL(id));
  return response.data;
}

export async function getReportCardPreview(id) {
  const response = await api.get(API.REPORT_CARDS.PREVIEW(id));
  return response.data;
}

export async function generateReportCard(payload) {
  const response = await api.post(API.REPORT_CARDS.GENERATE, payload);
  return response.data;
}

export async function generateReportCardsBulk(payload) {
  const response = await api.post(API.REPORT_CARDS.GENERATE_BULK, payload);
  return response.data;
}

export async function updateReportCard(id, payload) {
  const response = await api.put(API.REPORT_CARDS.UPDATE(id), payload);
  return response.data;
}

export async function archiveReportCard(id) {
  const response = await api.delete(API.REPORT_CARDS.DELETE(id));
  return response.data;
}

export async function restoreReportCard(id) {
  const response = await api.patch(API.REPORT_CARDS.RESTORE(id));
  return response.data;
}

export async function verifyReportCards(payload) {
  const response = await api.post(API.REPORT_CARDS.VERIFY, payload);
  return response.data;
}

export async function unverifyReportCards(payload) {
  const response = await api.post(API.REPORT_CARDS.UNVERIFY, payload);
  return response.data;
}

export async function publishReportCards(payload) {
  const response = await api.post(API.REPORT_CARDS.PUBLISH, payload);
  return response.data;
}

export async function unpublishReportCards(payload) {
  const response = await api.post(API.REPORT_CARDS.UNPUBLISH, payload);
  return response.data;
}

export async function lockReportCards(payload) {
  const response = await api.post(API.REPORT_CARDS.LOCK, payload);
  return response.data;
}

export async function unlockReportCards(payload) {
  const response = await api.post(API.REPORT_CARDS.UNLOCK, payload);
  return response.data;
}
