import api from "../services/api.js";

export const getItems = (params = {}) => 
    api.get('/items',{params}).then((res) => res.data);

export const getItemById = (id) => 
    api.get(`/items/${id}`).then((res) => res.data);

export const createItem = (formData) => 
    api.post('/items',formData).then((res) => res.data);

export const updateItem = (id, formData) => 
    api.put(`/items/${id}`,formData).then((res) => res.data);

export const deleteItem = (id) => 
    api.delete(`/items/${id}`).then((res) => res.data);