import api from "../api/axios";

export async function getStudents() {
    const response = await api.get("/students");
    return response.data;
}

export async function getStudent(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
}

export async function createStudent(student) {
    const response = await api.post("/students", student);
    return response.data;
}

export async function updateStudent(id, student) {
    const response = await api.put(`/students/${id}`, student);
    return response.data;
}

export async function deleteStudent(id) {
    const response = await api.delete(`/students/${id}`);
    return response.data;
}