import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Department API service — supplies department options for teacher registration.
 */
export async function getDepartments() {
  const response = await api.get(API.DEPARTMENTS.LIST);
  return response.data;
}
