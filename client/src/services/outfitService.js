import api from "../services/api.js";

export const getOutfits = (params = {}) => 
    api.get("/outfits", {params}).then((res) => res.data);

export const getOutfitById = (id) =>
    api.get(`outfits/${id}`).then((res) => res.data);

export const getOOTD = async (gender) => {
    const data = await getOutfits({ gender, isOOTD: true });
    return { outfit: data.outfits?.[0] || null };
};

export const getTrendingOutfits = (params = {}) =>
    api.get("/outfits",{params: {...params, isTrending: true}}).then((res) => res.data);