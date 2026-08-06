import api from "../../api/axios";
import API from "../../constants/api";

export async function getAuditLogs(params = {}) {
  const response = await api.get(API.AUDITS.LIST, { params });
  return response.data;
}

export async function getAuditLogById(id) {
  const response = await api.get(API.AUDITS.DETAIL(id));
  return response.data;
}
