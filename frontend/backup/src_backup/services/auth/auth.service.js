// src/services/auth/auth.service.js

import apiClient from "../axios";

/**
 * Login
 */
export const login = async(credentials) => {
    const response = await apiClient.post(
        "/auth/login",
        credentials
    );

    return response.data;
};

/**
 * Logout
 */
export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
};

/**
 * Save Authentication Data
 */
export const saveAuth = (data) => {
    localStorage.setItem(
        "accessToken",
        data.accessToken
    );

    if (data.refreshToken) {
        localStorage.setItem(
            "refreshToken",
            data.refreshToken
        );
    }

    localStorage.setItem(
        "user",
        JSON.stringify(data.user)
    );
};

/**
 * Get Access Token
 */
export const getAccessToken = () => {
    return localStorage.getItem(
        "accessToken"
    );
};

/**
 * Get Current User
 */
export const getCurrentUser = () => {
    const user = localStorage.getItem(
        "user"
    );

    return user ?
        JSON.parse(user) :
        null;
};

/**
 * Check Authentication
 */
export const isAuthenticated = () => {
    return !!getAccessToken();
};