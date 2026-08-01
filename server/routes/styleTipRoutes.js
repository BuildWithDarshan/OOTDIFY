import express from "express";
import { createStyleTip, getStyleTipById, getStyleTips, updateStyleTip, deleteStyleTip } from "../controllers/styleTipController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {adminMiddleware} from "../middleware/adminMiddleware.js";
import {uploadSingleImage} from "../middleware/uploadMiddleware.js";

const styleTipRouter = express.Router();

styleTipRouter.get('/', getStyleTips);
styleTipRouter.get('/:id', getStyleTipById);

styleTipRouter.post('/', authMiddleware, adminMiddleware, uploadSingleImage, createStyleTip);
styleTipRouter.put('/:id', authMiddleware, adminMiddleware, uploadSingleImage, updateStyleTip);
styleTipRouter.delete('/:id', authMiddleware, adminMiddleware, deleteStyleTip);

export default styleTipRouter;