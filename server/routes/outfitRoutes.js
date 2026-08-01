import express from "express";
import { createOutfit, getOutfitById, getOutfits, updateOutfit, setOutfitOfTheDay, deleteOutfit } from "../controllers/outfitController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {adminMiddleware} from "../middleware/adminMiddleware.js";
import {uploadOutfitImage} from "../middleware/uploadMiddleware.js";
import { validateCreateOutfit, validateUpdateOutfit } from "../validations/outfitValidation.js";

const outfitRouter = express.Router();

outfitRouter.get('/', getOutfits);
outfitRouter.get('/:id', getOutfitById);

outfitRouter.post('/', authMiddleware, adminMiddleware, uploadOutfitImage,validateCreateOutfit, createOutfit);
outfitRouter.put('/:id', authMiddleware, adminMiddleware, uploadOutfitImage,validateUpdateOutfit, updateOutfit);
outfitRouter.patch('/:id/ootd', authMiddleware, adminMiddleware, setOutfitOfTheDay);
outfitRouter.delete('/:id', authMiddleware, adminMiddleware, deleteOutfit);

export default outfitRouter;