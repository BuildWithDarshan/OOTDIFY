import api from "./api.js";

export const getOccasions = () =>
    api.get("/occasions").then((res) => res.data);

export const getOutfitTypes = () => 
    api.get("/outfit-types").then((res) => res.data);