import api from "../../api/axios";
import API from "../../constants/api";

export async function uploadFile(file, { category = "OTHER", entityType, entityId } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  if (entityType) formData.append("entityType", entityType);
  if (entityId != null) formData.append("entityId", String(entityId));

  const response = await api.post(API.UPLOADS.CREATE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteUploadedFile(id) {
  const response = await api.delete(API.UPLOADS.DELETE(id));
  return response.data;
}
