import api from "../../api/axios";
import API from "../../constants/api";

export const login = async(email, password) => {
    const response = await api.post(API.AUTH.LOGIN, {
        email,
        password,
    });

    return response.data;
};

export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
};

export const saveAuth = (data) => {
    localStorage.setItem(
        "accessToken",
        data.accessToken
    );

    localStorage.setItem(
        "refreshToken",
        data.refreshToken
    );

    localStorage.setItem(
        "user",
        JSON.stringify(data.user)
    );
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