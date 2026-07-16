import api from "../api/axios";

export const getDashboardStatistics = async() => {
    const response = await api.get("/dashboard");

    return response.data;
};