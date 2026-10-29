import express from "express";
import { previewProductImport } from "../controllers/productImportController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

function requireLocalProductImport(req, res, next) {
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
    "/preview",
    requireLocalProductImport,
    authMiddleware,
    adminMiddleware,
    previewProductImport
);

export default router;