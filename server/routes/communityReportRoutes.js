import express from "express";
import { clerkMiddleware } from "@clerk/express";
import {
    createCommunityReport,
    getCommunityReports,
    reviewCommunityReport,
    setCommunityOutfitVisibility,
} from "../controllers/communityReportController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { clerkAuthMiddleware } from "../middleware/clerkAuthMiddleware.js";

const communityReportRouter = express.Router();

// Members submit reports using Clerk authentication.
communityReportRouter.post(
    "/",
    clerkMiddleware(),
    clerkAuthMiddleware,
    createCommunityReport,
);

// Admin report review and outfit visibility controls use the existing admin JWT.
communityReportRouter.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getCommunityReports,
);

communityReportRouter.patch(
    "/:reportId/review",
    authMiddleware,
    adminMiddleware,
    reviewCommunityReport,
);

communityReportRouter.patch(
    "/outfits/:outfitId/visibility",
    authMiddleware,
    adminMiddleware,
    setCommunityOutfitVisibility,
);

export default communityReportRouter;