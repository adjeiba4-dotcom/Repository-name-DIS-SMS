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
    fetchCurrentUser,
} from "../services/auth/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const hydrate = async () => {
            const cachedUser = getCurrentUser();

            if (cachedUser) {
                setUser(cachedUser);
            }

            if (!isAuthenticated()) {
                if (!cancelled) setLoading(false);
                return;
            }

            try {
                // Refresh profile so greetings use current display name fields.
                const freshUser = await fetchCurrentUser();
                if (!cancelled && freshUser) {
                    setUser(freshUser);
                    localStorage.setItem("user", JSON.stringify(freshUser));
                }
            } catch {
                // Keep cached user if /me fails; auth interceptors handle 401.
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        hydrate();

        return () => {
            cancelled = true;
        };
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
