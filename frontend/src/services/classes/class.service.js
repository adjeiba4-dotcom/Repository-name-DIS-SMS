import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Class API service — supplies class options for student registration.
 */
export async function getClasses() {
  const response = await api.get(API.CLASSES.LIST);
  return response.data;
}
