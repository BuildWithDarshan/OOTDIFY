import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { getCurrentProfile, updateProfile, uploadProfilePicture, getFavourites, addFavourite, removeFavourite } from "../controllers/userController.js";
import { clerkAuthMiddleware } from "../middleware/clerkAuthMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";

const userRouter = express.Router();

userRouter.use(clerkMiddleware());
userRouter.use(clerkAuthMiddleware);

userRouter.get('/me', getCurrentProfile);
userRouter.put('/profile', updateProfile);
userRouter.post('/profile/picture', uploadSingleImage, uploadProfilePicture);

userRouter.get('/favourites', getFavourites);
userRouter.post('/favourites/:outfitId', addFavourite);
userRouter.delete('/favourites/:outfitId', removeFavourite);

export default userRouter;
