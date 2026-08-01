import api from "./api.js";

export const getItems = (params = {}) =>
    api.get("/items", {params}).then((res) => res.data);