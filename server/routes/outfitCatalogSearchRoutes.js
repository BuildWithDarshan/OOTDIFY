import express from "express";
import { searchOutfitCatalog } from "../controllers/outfitCatalogSearchController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

function requireLocalCatalogSearch(req, res, next) {
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

router.post(
    "/",
    requireLocalCatalogSearch,
    authMiddleware,
    adminMiddleware,
    searchOutfitCatalog
);

export default router;