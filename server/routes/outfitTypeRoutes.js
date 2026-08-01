import express from "express";
import { createOutfitType, getOutfitTypeById, getOutfitTypes, updateOutfitType, deleteOutfitType } from "../controllers/outfitTypeController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const outfitTypeRouter = express.Router();

outfitTypeRouter.get('/',getOutfitTypes);
outfitTypeRouter.get('/:id', getOutfitTypeById);

outfitTypeRouter.post('/',authMiddleware, adminMiddleware, createOutfitType);
outfitTypeRouter.put('/:id', authMiddleware, adminMiddleware, updateOutfitType);
outfitTypeRouter.delete('/:id', authMiddleware, adminMiddleware, deleteOutfitType);

export default outfitTypeRouter;