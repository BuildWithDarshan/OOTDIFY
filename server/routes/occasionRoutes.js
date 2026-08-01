import express from "express";
import { createOccasion, getOccasionById, getOccasions, updateOccasion, deleteOccasion } from "../controllers/occasionController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const occasionRouter = express.Router();

occasionRouter.get('/',getOccasions);
occasionRouter.get('/:id',getOccasionById);

occasionRouter.post('/', authMiddleware, adminMiddleware, createOccasion);
occasionRouter.put('/:id',authMiddleware, adminMiddleware, updateOccasion);
occasionRouter.delete('/:id', authMiddleware, adminMiddleware, deleteOccasion);

export default occasionRouter;

