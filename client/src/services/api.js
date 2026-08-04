import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
})

let getAuthToken = async () => null;

const setAuthTokenGetter = (tokenGetter) => {
    getAuthToken = tokenGetter || (async () => null);
};

api.interceptors.request.use(
    async (config) => {
        const token = await getAuthToken();
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
)

export default api;
export {setAuthTokenGetter, API_BASE_URL};
