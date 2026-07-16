import api from "../api/axios";

export async function getStudents() {
    const response = await api.get("/students");

    return response.data;
}