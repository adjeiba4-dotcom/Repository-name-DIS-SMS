import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Grade scale / band APIs for configurable Results Engine grading.
 */

export async function getGradeScales(params = {}) {
  const response = await api.get(API.GRADES.SCALES, { params });
  return response.data;
}

export async function getGradeScaleById(id) {
  const response = await api.get(API.GRADES.SCALE_DETAIL(id));
  return response.data;
}

export async function createGradeScale(payload) {
  const response = await api.post(API.GRADES.SCALES, payload);
  return response.data;
}

export async function updateGradeScale(id, payload) {
  const response = await api.put(API.GRADES.SCALE_DETAIL(id), payload);
  return response.data;
}

export async function setDefaultGradeScale(id) {
  const response = await api.patch(API.GRADES.SCALE_DEFAULT(id));
  return response.data;
}

export async function getGrades(params = {}) {
  const response = await api.get(API.GRADES.LIST, { params });
  return response.data;
}

export async function createGrade(payload) {
  const response = await api.post(API.GRADES.CREATE, payload);
  return response.data;
}

export async function updateGrade(id, payload) {
  const response = await api.put(API.GRADES.DETAIL(id), payload);
  return response.data;
}

export async function deactivateGrade(id) {
  const response = await api.delete(API.GRADES.DETAIL(id));
  return response.data;
}
