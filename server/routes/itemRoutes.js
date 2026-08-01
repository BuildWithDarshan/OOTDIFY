import express from "express";
import { createItem, getItems, getItemById, updateItem, deleteItem } from "../controllers/itemController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {uploadSingleImage} from "../middleware/uploadMiddleware.js";
import { validateCreateItem, validateUpdateItem } from "../validations/itemValidation.js";

const itemRouter = express.Router();

itemRouter.get('/', getItems);
itemRouter.get('/:id',getItemById);

itemRouter.post('/', authMiddleware, adminMiddleware,uploadSingleImage,validateCreateItem, createItem);
itemRouter.put('/:id', authMiddleware, adminMiddleware,uploadSingleImage,validateUpdateItem, updateItem);
itemRouter.delete('/:id', authMiddleware, adminMiddleware, deleteItem);

export default itemRouter;