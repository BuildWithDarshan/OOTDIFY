import api from "./api.js";

export const previewProductImport = (productUrl) =>
    api.post("/product-import/preview", { productUrl }).then((res) => res.data);
