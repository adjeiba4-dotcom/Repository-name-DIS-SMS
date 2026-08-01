// src/contexts/AuthContext.jsx

import {
    createContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    login as loginService,
    logout as logoutService,
    saveAuth,
    getCurrentUser,
    isAuthenticated as checkAuthentication,
} from "../services/auth/auth.service";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();

        if (currentUser) {
            setUser(currentUser);
        }

        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const response = await loginService(credentials);

        saveAuth(response.data.data);

        setUser(response.data.data.user);

        return response.data;
    };

    const logout = () => {
        logoutService();
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
            isAuthenticated: checkAuthentication(),
        }),
        [user, loading]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}