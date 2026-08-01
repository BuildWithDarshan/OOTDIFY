import express from "express";
import  {testUpload} from "../controllers/uploadController.js";
import {uploadSingleImage} from "../middleware/uploadMiddleware.js"
import {authMiddleware} from "../middleware/authMiddleware.js"
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const uploadRouter = express.Router();
uploadRouter.post('/test',authMiddleware, adminMiddleware,uploadSingleImage,testUpload);

export default uploadRouter;