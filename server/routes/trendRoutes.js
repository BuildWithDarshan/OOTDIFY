import express from "express";
import { createTrend, getTrendById, getTrends, updateTrend, deleteTrend } from "../controllers/trendController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {adminMiddleware} from "../middleware/adminMiddleware.js";
import {uploadSingleImage} from "../middleware/uploadMiddleware.js";

const trendRouter = express.Router();

trendRouter.get('/',getTrends);
trendRouter.get('/:id', getTrendById);

trendRouter.post('/', authMiddleware, adminMiddleware, uploadSingleImage, createTrend);
trendRouter.put('/:id', authMiddleware, adminMiddleware, uploadSingleImage, updateTrend);
trendRouter.delete('/:id', authMiddleware, adminMiddleware, deleteTrend);

export default trendRouter;