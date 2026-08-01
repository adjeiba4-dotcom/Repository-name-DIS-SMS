import api from "../api/axios";

const BASE_URL = "/teachers";

const getTeachers = async(search = "") => {
    const response = await api.get(
        `${BASE_URL}?search=${encodeURIComponent(search)}`
    );
    return response.data;
};

const getTeacher = async(id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
};

const createTeacher = async(teacherData) => {
    const response = await api.post(BASE_URL, teacherData);
    return response.data;
};

const updateTeacher = async(id, teacherData) => {
    const response = await api.put(
        `${BASE_URL}/${id}`,
        teacherData
    );
    return response.data;
};

const deleteTeacher = async(id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
};

export default {
    getTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
};