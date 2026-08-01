import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getCurrentUser } from "../services/authService.js";
import { TOKEN_KEY, getStoredToken, clearStoredToken } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateExistingToken = async () => {
            const token = getStoredToken();

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getCurrentUser();
                setUser(data.user);
            } catch {
                clearStoredToken();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        validateExistingToken();
    }, []);

   
    const login = async (email, password, rememberMe = true) => {
        const data = await loginUser({ email, password });
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (name, email, password) => {
        const data = await registerUser({ name, email, password });
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        clearStoredToken();
        setUser(null);
    };

    const updateUserInfo = (updatedFields) => {
        setUser((prev) => ({ ...prev, ...updatedFields }));
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUserInfo,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};