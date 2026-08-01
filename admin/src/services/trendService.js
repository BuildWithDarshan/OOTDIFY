import api from "../services/api.js";

export const getTrends = (params = {}) => 
    api.get('/trends',{params}).then((res) => res.data);

export const getTrendById = (id) => 
    api.get(`/trends/${id}`).then((res) => res.data);

export const createTrend = (formData) => 
    api.post('/trends',formData).then((res) => res.data);

export const updateTrend = (id, formData) => 
    api.put(`/trends/${id}`,formData).then((res) => res.data);

export const deleteTrend = (id) => 
    api.delete(`/trends/${id}`).then((res) => res.data);