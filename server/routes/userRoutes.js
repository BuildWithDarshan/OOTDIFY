import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { getCurrentProfile, updateProfile, getFavourites, addFavourite, removeFavourite } from "../controllers/userController.js";
import { clerkAuthMiddleware } from "../middleware/clerkAuthMiddleware.js";

const userRouter = express.Router();

userRouter.use(clerkMiddleware());
userRouter.use(clerkAuthMiddleware);

userRouter.get('/me', getCurrentProfile);
userRouter.put('/profile', updateProfile);

userRouter.get('/favourites', getFavourites);
userRouter.post('/favourites/:outfitId', addFavourite);
userRouter.delete('/favourites/:outfitId', removeFavourite);

export default userRouter;
