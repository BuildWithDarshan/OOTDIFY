import api from "../services/api.js";

export const getStyleTips = (params = {}) => 
    api.get('/style-tips',{params}).then((res) => res.data);

export const getStyleTipById = (id) => 
    api.get(`/style-tips/${id}`).then((res) => res.data);

export const createStyleTip = (formData) => 
    api.post('/style-tips',formData).then((res) => res.data);

export const updateStyleTip = (id, formData) => 
    api.put(`/style-tips/${id}`,formData).then((res) => res.data);

export const deleteStyleTip = (id) => 
    api.delete(`/style-tips/${id}`).then((res) => res.data);