import api from "../../api/axios";
import API from "../../constants/api";

export async function getNotifications(params = {}) {
  const response = await api.get(API.NOTIFICATIONS.LIST, { params });
  return response.data;
}

export async function getUnreadNotificationCount() {
  const response = await api.get(API.NOTIFICATIONS.UNREAD_COUNT);
  return response.data;
}

export async function markNotificationRead(id) {
  const response = await api.patch(API.NOTIFICATIONS.MARK_READ(id));
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.post(API.NOTIFICATIONS.MARK_ALL_READ);
  return response.data;
}
