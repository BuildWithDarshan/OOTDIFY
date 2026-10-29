
  import api from "./api.js";
  
  export const getApprovedRetailerSources = () =>
      api.get("/retailer-search-links/sources").then((res) => res.data);

  export const getRetailerSearchLinks = ({
      query,
      queries,
      sourceTypes,
      sourceIds,
  } = {}) =>
      api
          .post("/retailer-search-links", {
              ...(query ? { query } : {}),
              ...(queries ? { queries } : {}),
              ...(sourceTypes ? { sourceTypes } : {}),
              ...(sourceIds ? { sourceIds } : {}),
          })
          .then((res) => res.data);