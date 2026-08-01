// src/services/axios.js

import axios from "axios";
import API from "../constants/api";

/**
 * Axios Instance
 */
const apiClient = axios.create({
    baseURL: API.BASE_API_URL,
    timeout: API.TIMEOUT,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

/**
 * Request Interceptor
 * Automatically attach JWT token
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 */
apiClient.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default apiClient;