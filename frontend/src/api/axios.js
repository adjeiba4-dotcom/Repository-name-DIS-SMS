import axios from "axios";
import API from "../constants/api";

const api = axios.create({
  baseURL: API.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

function clearAuthStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

function isAuthEndpoint(url = "") {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/refresh-token") ||
    url.includes("/auth/logout")
  );
}

function redirectToLogin() {
  clearAuthStorage();
  const onLoginPage = window.location.pathname.startsWith("/login");
  if (!onLoginPage) {
    window.location.assign("/login?reason=session-expired");
  }
}

/**
 * Attempt a single silent refresh using the stored refresh token.
 */
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available.");
  }

  const response = await axios.post(
    `${API.BASE_URL}${API.AUTH.REFRESH}`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } }
  );

  const envelope = response.data;
  const payload = envelope?.data?.accessToken ? envelope.data : envelope;

  if (!payload?.accessToken) {
    throw new Error("Refresh response missing access token.");
  }

  localStorage.setItem("accessToken", payload.accessToken);
  if (payload.refreshToken) {
    localStorage.setItem("refreshToken", payload.refreshToken);
  }

  return payload.accessToken;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;
    const requestUrl = originalRequest?.url || "";

    if (
      status !== 401 ||
      !originalRequest ||
      isAuthEndpoint(requestUrl) ||
      originalRequest._retry
    ) {
      if (status === 401 && !isAuthEndpoint(requestUrl)) {
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const accessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch {
      redirectToLogin();
      return Promise.reject(error);
    }
  }
);

export default api;
