import api from "./api.js";

export const SearchOutfitCatalog = (garments) => 
    api.post("/outfit-catalog-search",{garments}).then((res) => res.data);
