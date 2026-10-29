import express from "express"
import { getAllUsers, getDashboardStats } from "../controllers/adminController.js"
import {authMiddleware} from "../middleware/authMiddleware.js"
import {adminMiddleware} from "../middleware/adminMiddleware.js"
import { rotateOOTDFromCron } from "../controllers/ootdCronController.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", authMiddleware, adminMiddleware, getDashboardStats);
adminRouter.get("/users",authMiddleware, adminMiddleware, getAllUsers);
adminRouter.get("/ootd/rotate", rotateOOTDFromCron);

export default adminRouter;
