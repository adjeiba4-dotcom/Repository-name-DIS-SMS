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
        ARCHIVED: "/guardians/archived",
        DETAIL: (id) => `/guardians/${id}`,
        UPDATE: (id) => `/guardians/${id}`,
        DELETE: (id) => `/guardians/${id}`,
        RESTORE: (id) => `/guardians/${id}/restore`,
        BY_STUDENT: (studentId) => `/students/${studentId}/guardians`,
        LINK: (studentId) => `/students/${studentId}/guardians`,
        UNLINK: (studentId, guardianId) =>
            `/students/${studentId}/guardians/${guardianId}`,
    },

    CLASSES: {
        LIST: "/classes",
        CREATE: "/classes",
        ARCHIVED: "/classes/archived",
        DETAIL: (id) => `/classes/${id}`,
        UPDATE: (id) => `/classes/${id}`,
        DELETE: (id) => `/classes/${id}`,
        RESTORE: (id) => `/classes/${id}/restore`,
    },

    TEACHERS: {
        LIST: "/teachers",
        CREATE: "/teachers",
        SEARCH: "/teachers/search",
        ARCHIVED: "/teachers/archived",
        DETAIL: (id) => `/teachers/${id}`,
        UPDATE: (id) => `/teachers/${id}`,
        DELETE: (id) => `/teachers/${id}`,
        RESTORE: (id) => `/teachers/${id}/restore`,
    },

    DEPARTMENTS: {
        LIST: "/departments",
    },

    ACADEMIC_YEARS: {
        LIST: "/academic-years",
        CREATE: "/academic-years",
        ARCHIVED: "/academic-years/archived",
        DETAIL: (id) => `/academic-years/${id}`,
        UPDATE: (id) => `/academic-years/${id}`,
        DELETE: (id) => `/academic-years/${id}`,
        RESTORE: (id) => `/academic-years/${id}/restore`,
    },

    TERMS: {
        LIST: "/terms",
        CREATE: "/terms",
        ARCHIVED: "/terms/archived",
        DETAIL: (id) => `/terms/${id}`,
        UPDATE: (id) => `/terms/${id}`,
        DELETE: (id) => `/terms/${id}`,
        ACTIVATE: (id) => `/terms/${id}/activate`,
        RESTORE: (id) => `/terms/${id}/restore`,
    },
};

export default API;
