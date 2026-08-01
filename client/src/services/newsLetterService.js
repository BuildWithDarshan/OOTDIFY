import api from "./api.js";

export const subscribeToNewsletter = (email) =>
  api.post("/newsletter/subscribe", { email }).then((res) => res.data);