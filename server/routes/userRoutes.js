import express from "express";
import { updateProfile, getFavourites, addFavourite, removeFavourite } from "../controllers/userController.js";
import {authMiddleware} from "../middleware/authMiddleware.js"

const userRouter = express.Router();

userRouter.put('/profile', authMiddleware, updateProfile);

userRouter.get('/favourites',authMiddleware, getFavourites);
userRouter.post('/favourites/:outfitId',authMiddleware, addFavourite);
userRouter.delete('/favourites/:outfitId', authMiddleware, removeFavourite);

export default userRouter;