import api from "../services/api.js";

export const getOutfits = (params = {}) => 
    api.get('/outfits',{params}).then((res) => res.data);

export const getOutfitById = (id) => 
    api.get(`/outfits/${id}`).then((res) => res.data);

export const createOutfit = (formData) => 
    api.post('/outfits',formData).then((res) => res.data);

export const updateOutfit = (id, formData) => 
    api.put(`/outfits/${id}`,formData).then((res) => res.data);

export const setOutfitOfTheDay = (id) =>
    api.patch(`/outfits/${id}/ootd`).then((res) => res.data);

export const deleteOutfit = (id) => 
    api.delete(`/outfits/${id}`).then((res) => res.data);