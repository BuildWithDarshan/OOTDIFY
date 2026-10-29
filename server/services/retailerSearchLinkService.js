import { getApprovedRetailers } from "../config/approvedRetailers.js";
  const MAX_QUERY_LENGTH = 120;
  function normalizeQuery(query) {
      if (typeof query !== "string") return "";
      return query.trim().replace(/\s+/g, " ").slice(0, MAX_QUERY_LENGTH);
  }
  
  function encodeQueryForSource(source, query) {
      if (source.id === "myntra") {
          return query
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-");
      }
      return encodeURIComponent(query);
  }
  function buildSearchUrl(source, query) {
      if (!source.searchUrlTemplate) {
          return null;
      }
      const encoded = encodeQueryForSource(source, query);
      if (!encoded) return null;
      return source.searchUrlTemplate.replace("{query}", encoded);
  }
  

  export function buildRetailerSearchLinks(query, options = {}) {
      const normalizedQuery = normalizeQuery(query);
      if (!normalizedQuery) {
          return {
              query: "",
              links: [],
          };
      }
      const {
          enabledOnly = true,
          sourceTypes = null, 
          sourceIds = null, 
      } = options;
      let sources = getApprovedRetailers({ enabledOnly });
      if (Array.isArray(sourceTypes) && sourceTypes.length > 0) {
          const allowed = new Set(sourceTypes);
          sources = sources.filter((source) => allowed.has(source.sourceType));
      }
      if (Array.isArray(sourceIds) && sourceIds.length > 0) {
          const allowed = new Set(sourceIds);
          sources = sources.filter((source) => allowed.has(source.id));
      }
      const links = sources
          .map((source) => {
              const searchUrl = buildSearchUrl(source, normalizedQuery);
              return {
                  sourceId: source.id,
                  displayName: source.displayName,
                  sourceType: source.sourceType,
                  query: normalizedQuery,
                  searchUrl,
                  homepageUrl: `https://${source.domains[0]}`,
                  supportsAutomatedSearch: source.supportsAutomatedSearch,
                  available: Boolean(searchUrl),
              };
          });
      return {
          query: normalizedQuery,
          links,
      };
  }
  
  
  export function buildRetailerSearchLinksForQueries(queries, options = {}) {
      const list = Array.isArray(queries) ? queries : [];
      return list
          .map((query) => normalizeQuery(query))
          .filter(Boolean)
          .slice(0, 5)
          .map((query) => buildRetailerSearchLinks(query, options));
  }
  export default {
      buildRetailerSearchLinks,
      buildRetailerSearchLinksForQueries,
  };
