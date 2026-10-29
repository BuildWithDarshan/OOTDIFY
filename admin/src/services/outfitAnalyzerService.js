import api from "./api.js";

export const analyzeOutfit = (formData) =>
    api.post("/outfit-analyzer", formData).then((response) => response.data);