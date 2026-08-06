import api from "../../api/axios";
import API from "../../constants/api";

/**
 * Normalize login / refresh envelopes to the auth payload object.
 */
function unwrapAuthPayload(envelope) {
  if (envelope?.data?.accessToken) {
    return envelope.data;
  }
  return envelope;
}

/**
 * Normalize /auth/me envelopes to the user object.
 */
function unwrapUserPayload(envelope) {
  if (envelope?.data && typeof envelope.data === "object") {
    // Login-shaped accidental wrap should not apply here.
    if (envelope.data.accessToken && envelope.data.user) {
      return envelope.data.user;
    }
    return envelope.data;
  }
  return envelope;
}

export const login = async (email, password) => {
  const response = await api.post(API.AUTH.LOGIN, {
    email,
    password,
  });

  return unwrapAuthPayload(response.data);
};

export const fetchCurrentUser = async () => {
  const response = await api.get(API.AUTH.ME);
  return unwrapUserPayload(response.data);
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const saveAuth = (data) => {
  const payload = unwrapAuthPayload(data);

  localStorage.setItem("accessToken", payload.accessToken);
  localStorage.setItem("refreshToken", payload.refreshToken);
  localStorage.setItem("user", JSON.stringify(payload.user));
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  if (
    user == null ||
    user === "" ||
    user === "undefined" ||
    user === "null"
  ) {
    if (user === "undefined" || user === "null" || user === "") {
      localStorage.removeItem("user");
    }
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken");
};
