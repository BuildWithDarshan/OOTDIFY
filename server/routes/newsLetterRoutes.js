import express from "express";
import { subscribe, getSubscribers, removeSubscriber } from "../controllers/newsLetterController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const newsletterRouter = express.Router();

newsletterRouter.post('/subscribe', subscribe);

newsletterRouter.get('/', authMiddleware, adminMiddleware, getSubscribers);
newsletterRouter.delete('/:id', authMiddleware, adminMiddleware, removeSubscriber);

export default newsletterRouter;
