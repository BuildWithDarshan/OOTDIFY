import api from "./api.js";

export const getTrends = (params = {}) => 
    api.get("/trends", {params}).then((res) => res.data);

export const getTrendById = (id) =>
    api.get(`/trends/${id}`).then((res) => res.data);