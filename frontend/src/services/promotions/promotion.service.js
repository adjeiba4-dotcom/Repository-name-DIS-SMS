import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Student Promotion & Graduation API service.
 */

export async function getPromotions(params = {}) {
  const response = await api.get(API.STUDENT_PROMOTIONS.LIST, { params });
  return response.data;
}

export async function getArchivedPromotions(params = {}) {
  const response = await api.get(API.STUDENT_PROMOTIONS.ARCHIVED, { params });
  return response.data;
}

export async function getGraduates(params = {}) {
  const response = await api.get(API.STUDENT_PROMOTIONS.GRADUATES, { params });
  return response.data;
}

export async function getPromotionStats(params = {}) {
  const response = await api.get(API.STUDENT_PROMOTIONS.STATS, { params });
  return response.data;
}

export async function getPromotionById(id) {
  const response = await api.get(API.STUDENT_PROMOTIONS.DETAIL(id));
  return response.data;
}

export async function getStudentPromotionHistory(studentId) {
  const response = await api.get(API.STUDENT_PROMOTIONS.HISTORY(studentId));
  return response.data;
}

export async function recommendPromotions(payload) {
  const response = await api.post(API.STUDENT_PROMOTIONS.RECOMMEND, payload);
  return response.data;
}

export async function updatePromotion(id, payload) {
  const response = await api.put(API.STUDENT_PROMOTIONS.UPDATE(id), payload);
  return response.data;
}

export async function approvePromotions(payload) {
  const response = await api.post(API.STUDENT_PROMOTIONS.APPROVE, payload);
  return response.data;
}

export async function unapprovePromotions(payload) {
  const response = await api.post(API.STUDENT_PROMOTIONS.UNAPPROVE, payload);
  return response.data;
}

export async function executePromotions(payload) {
  const response = await api.post(API.STUDENT_PROMOTIONS.EXECUTE, payload);
  return response.data;
}

export async function cancelPromotions(payload) {
  const response = await api.post(API.STUDENT_PROMOTIONS.CANCEL, payload);
  return response.data;
}

export async function archivePromotion(id) {
  const response = await api.delete(API.STUDENT_PROMOTIONS.DELETE(id));
  return response.data;
}

export async function restorePromotion(id) {
  const response = await api.patch(API.STUDENT_PROMOTIONS.RESTORE(id));
  return response.data;
}
