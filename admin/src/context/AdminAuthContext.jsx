import { createContext, useContext, useState, useEffect, Children  } from "react";
import api from "../services/api.js";

const AdminAuthContext = createContext(null);

const TOKEN_KEY = "ootdify_admin_token";

export const AdminAuthProvider =  ({children}) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateExchangeToken = async() => {
            const token = localStorage.getItem(TOKEN_KEY);
            

            if(!token) {
                setLoading(false);
                return;
            }

            try {
                const {data} = await api.get("/auth/me");
                

                if(data.user.role !== "admin") {
                    localStorage.removeItem(TOKEN_KEY);
                    setAdmin(null);
                }else {
                    setAdmin(data.user);
                }
            } catch (error) {
                console.error("Token validation failed:", error);
                localStorage.removeItem(TOKEN_KEY);
                setAdmin(null);
            }
            finally {
                setLoading(false);
            }
        };
        validateExchangeToken();
    }, []);

    const login = async(email, password) => {
        const {data} = await api.post("/auth/login",{email, password});

        if(data.user.role !== "admin") {
            throw new Error("This account does not have admin access");
        }
        localStorage.setItem(TOKEN_KEY, data.token);
        setAdmin(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setAdmin(null);
    }

    const updateAdminInfo = (updatedFields) => {
        setAdmin((prev) => ({...prev, ...updatedFields}));
    }

    const value = {
        admin,
        isAuthenticated: !!admin,
        loading,
        login,
        logout,
        updateAdminInfo,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );  
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if(!context) {
        throw new Error("useAdminAuth must be used within an AdminAuthProvider");
    }
    return context;
}