import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
})

const TOKEN_KEY = "ootdify_user_token";

const getStoredToken = () => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

const clearStoredToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use(
    (config) => {
        const token = getStoredToken(TOKEN_KEY);
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status === 401) {
            clearStoredToken();
        }
        return Promise.reject(error);
    }
)

export default api;
export {TOKEN_KEY, getStoredToken, clearStoredToken, API_BASE_URL};