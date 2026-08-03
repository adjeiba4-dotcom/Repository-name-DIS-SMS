const API = {
    BASE_URL: "http://localhost:5000/api",

    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh-token",
        ME: "/auth/me",
    },

    STUDENTS: {
        LIST: "/students",
        CREATE: "/students",
        SEARCH: "/students/search",
        ARCHIVED: "/students/archived",
        DETAIL: (id) => `/students/${id}`,
        UPDATE: (id) => `/students/${id}`,
        DELETE: (id) => `/students/${id}`,
        RESTORE: (id) => `/students/${id}/restore`,
    },

    GUARDIANS: {
        LIST: "/guardians",
        CREATE: "/guardians",
        UPDATE: (id) => `/guardians/${id}`,
    },

    CLASSES: {
        LIST: "/classes",
    },
};

export default API;
