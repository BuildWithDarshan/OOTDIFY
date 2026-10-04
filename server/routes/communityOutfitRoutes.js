import express from "express";
import { clerkMiddleware } from "@clerk/express";
import {
    createCommunityOutfit,
    deleteCommunityOutfit,
    getCommunityCreatorProfile,
    getCommunityOutfitById,
    getCommunityOutfits,
    getMyCommunityOutfits,
    getRelatedCommunityOutfits,
    updateCommunityOutfit,
} from "../controllers/communityOutfitController.js";
import { clerkAuthMiddleware } from "../middleware/clerkAuthMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";
import {
    validateCreateCommunityOutfit,
    validateUpdateCommunityOutfit,
} from "../validations/communityOutfitValidator.js";

const communityOutfitRouter = express.Router();

const requireUser = [clerkMiddleware(), clerkAuthMiddleware];

// Public routes
communityOutfitRouter.get("/", getCommunityOutfits);
communityOutfitRouter.get("/my", ...requireUser, getMyCommunityOutfits);
communityOutfitRouter.get("/creator/:userId", getCommunityCreatorProfile);
communityOutfitRouter.get("/:id/related", getRelatedCommunityOutfits);
communityOutfitRouter.get("/:id", getCommunityOutfitById);

// Signed-in member routes
communityOutfitRouter.post(
    "/",
    ...requireUser,
    uploadSingleImage,
    validateCreateCommunityOutfit,
    createCommunityOutfit,
);

communityOutfitRouter.put(
    "/:id",
    ...requireUser,
    uploadSingleImage,
    validateUpdateCommunityOutfit,
    updateCommunityOutfit,
);

communityOutfitRouter.delete(
    "/:id",
    ...requireUser,
    deleteCommunityOutfit,
);

export default communityOutfitRouter;