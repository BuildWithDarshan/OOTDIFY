import api from "./api.js";

export const getCurrentUser = () => api.get("/users/me").then((res) => res.data);
