import {
    createContext,
    useContext,
    useMemo,
    useState,
    useEffect,
} from "react";

import {
    login as loginService,
    logout as logoutService,
    saveAuth,
    getCurrentUser,
    isAuthenticated,
} from "../services/auth/auth.service";

const AuthContext = createContext(null);

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

    /**
     * Login user
     */
    const login = async (email, password) => {
        try {
            // loginService() already returns response.data
            const data = await loginService(email, password);

            // Save tokens and user
            saveAuth(data);

            // Update context
            setUser(data.user);

            return data;
        } catch (error) {
            throw error;
        }
    };

    /**
     * Logout user
     */
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
            isAuthenticated: isAuthenticated(),
        }),
        [user, loading]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    return useContext(AuthContext);
}