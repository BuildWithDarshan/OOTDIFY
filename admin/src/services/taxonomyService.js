import api from "./api.js";

export const getOccasions = () => api.get("/occasions").then((res) => res.data);
export const getOccasionById = (id) => api.get(`/occasions/${id}`).then((res) => res.data);
export const createOccasion = (payload) => api.post("/occasions", payload).then((res) => res.data);
export const updateOccasion = (id, payload) => api.put(`/occasions/${id}`, payload).then((res) => res.data);
export const deleteOccasion = (id) => api.delete(`/occasions/${id}`).then((res) => res.data);

export const getOutfitTypes = () => api.get("/outfit-types").then((res) => res.data);
export const getOutfitTypeById = (id) => api.get(`/outfit-types/${id}`).then((res) => res.data);
export const createOutfitType = (payload) => api.post("/outfit-types", payload).then((res) => res.data);
export const updateOutfitType = (id, payload) => api.put(`/outfit-types/${id}`, payload).then((res) => res.data);
export const deleteOutfitType = (id) => api.delete(`/outfit-types/${id}`).then((res) => res.data);