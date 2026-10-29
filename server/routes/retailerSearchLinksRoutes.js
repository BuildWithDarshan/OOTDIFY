  import express from "express";
  import {
      createRetailerSearchLinks,
      getRetailerRegistry,
  } from "../controllers/retailerSearchLinksController.js";
  import { authMiddleware } from "../middleware/authMiddleware.js";
  import { adminMiddleware } from "../middleware/adminMiddleware.js";
  const router = express.Router();
  function requireLocalRetailerSearch(req, res, next) {
      const enabled = process.env.OUTFIT_ANALYZER_ENABLED === "true";
      const isDevelopment = process.env.NODE_ENV === "development";
      if (!enabled || !isDevelopment) {
          return res.status(404).json({
              success: false,
              message: "Route not found",
          });
      }
      next();
  }
  router.get(
      "/sources",
      requireLocalRetailerSearch,
      authMiddleware,
      adminMiddleware,
      getRetailerRegistry
  );
  router.post(
      "/",
      requireLocalRetailerSearch,
      authMiddleware,
      adminMiddleware,
      createRetailerSearchLinks
  );
  export default router;