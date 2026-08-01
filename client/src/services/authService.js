import api from "../services/api.js";

export const registerUser = (payload) => api.post("/auth/register", payload).then((res) => res.data);

export const loginUser = (payload) => api.post("/auth/login", payload).then((res) => res.data);

export const logoutUser = () => api.post('/auth/logout').then((res) => res.data);

export const getCurrentUser = () => api.get("auth/me").then((res) => res.data);

export const changePassword = (payload) => api.put("/auth/change-password", payload).then((res) => res.data);