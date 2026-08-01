import api from "./api.js";

export const getStyleTips = (params = {}) =>
    api.get('/style-tips', {params}).then((res) => res.data);

export const getStyleTipById = (id) =>
    api.get(`/style-tips/${id}`).then((res) => res.data);