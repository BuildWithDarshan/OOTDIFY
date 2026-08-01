import api from "./api.js";

export const getFavourites = () => 
    api.get("/users/favourites").then((res) => res.data);

export const addFavourite = (outfitId) => 
    api.post(`/users/favourites/${outfitId}`).then((res) => res.data);

export const removeFavourite = (outfitId) =>
    api.delete(`/users/favourites/${outfitId}`).then((res) => res.data);

export const updateProfile = (payload) =>
    api.put("/users/profile",payload).then((res) => res.data);