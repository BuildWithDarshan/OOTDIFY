import express from "express";
import { clerkMiddleware } from "@clerk/express";
import {
    addCommunityComment,
    deleteCommunityComment,
    getCommunityComments,
    getCommunityInteractionState,
    getSavedCommunityOutfits,
    toggleCommunityLike,
    toggleCommunitySave,
} from "../controllers/communityInteractionController.js";
import { clerkAuthMiddleware } from "../middleware/clerkAuthMiddleware.js";

const communityInteractionRouter = express.Router();

const requireUser = [clerkMiddleware(), clerkAuthMiddleware];

// Must be registered before routes with an outfitId parameter.
communityInteractionRouter.get(
    "/saved",
    ...requireUser,
    getSavedCommunityOutfits,
);

communityInteractionRouter.get(
    "/:outfitId/state",
    ...requireUser,
    getCommunityInteractionState,
);

communityInteractionRouter.get(
    "/:outfitId/comments",
    getCommunityComments,
);

communityInteractionRouter.post(
    "/:outfitId/comments",
    ...requireUser,
    addCommunityComment,
);

communityInteractionRouter.delete(
    "/comments/:commentId",
    ...requireUser,
    deleteCommunityComment,
);

communityInteractionRouter.post(
    "/:outfitId/like",
    ...requireUser,
    toggleCommunityLike,
);

communityInteractionRouter.post(
    "/:outfitId/save",
    ...requireUser,
    toggleCommunitySave,
);

export default communityInteractionRouter;