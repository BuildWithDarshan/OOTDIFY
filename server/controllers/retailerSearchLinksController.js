 import { getApprovedRetailers } from "../config/approvedRetailers.js";
  import {
      buildRetailerSearchLinks,
      buildRetailerSearchLinksForQueries,
  } from "../services/retailerSearchLinkService.js";
  const MAX_QUERIES = 5;
  const MAX_QUERY_LENGTH = 120;
  function normalizeQueries(body) {
      if (Array.isArray(body?.queries)) {
          return body.queries;
      }
      if (typeof body?.query === "string") {
          return [body.query];
      }
      return null;
  }
  export const getRetailerRegistry = async (req, res) => {
      try {
          const sources = getApprovedRetailers({ enabledOnly: true }).map(
              (source) => ({
                  id: source.id,
                  displayName: source.displayName,
                  sourceType: source.sourceType,
                  domains: source.domains,
                  enabled: source.enabled,
                  supportsAutomatedSearch: source.supportsAutomatedSearch,
                  hasSearchUrl: Boolean(source.searchUrlTemplate),
              })
          );
          return res.status(200).json({
              success: true,
              sources,
          });
      } catch (error) {
          console.error("Failed to load approved retailers:", error);
          return res.status(500).json({
              success: false,
              message: "Something went wrong while loading approved sources.",
          });
      }
  };
  export const createRetailerSearchLinks = async (req, res) => {
      const queries = normalizeQueries(req.body ?? {});
      if (!queries) {
          return res.status(400).json({
              success: false,
              message: "Provide a query string or a queries array.",
          });
      }
      if (queries.length === 0 || queries.length > MAX_QUERIES) {
          return res.status(400).json({
              success: false,
              message: `Provide between 1 and ${MAX_QUERIES} search queries.`,
          });
      }
      if (
          !queries.every(
              (query) =>
                  typeof query === "string" &&
                  query.trim().length > 0 &&
                  query.trim().length <= MAX_QUERY_LENGTH
          )
      ) {
          return res.status(400).json({
              success: false,
              message: `Each query must be a non-empty string up to ${MAX_QUERY_LENGTH} characters.`,
          });
      }
      const sourceTypes = Array.isArray(req.body?.sourceTypes)
          ? req.body.sourceTypes
          : null;
      const sourceIds = Array.isArray(req.body?.sourceIds)
          ? req.body.sourceIds
          : null;
      try {
          const options = {
              enabledOnly: true,
              ...(sourceTypes ? { sourceTypes } : {}),
              ...(sourceIds ? { sourceIds } : {}),
          };
          const results =
              queries.length === 1
                  ? [buildRetailerSearchLinks(queries[0], options)]
                  : buildRetailerSearchLinksForQueries(queries, options);
          return res.status(200).json({
              success: true,
              results,
          });
      } catch (error) {
          console.error("Failed to build retailer search links:", error);
          return res.status(500).json({
              success: false,
              message: "Something went wrong while building search links.",
          });
      }
  };
