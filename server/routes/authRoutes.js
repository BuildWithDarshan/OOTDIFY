import express from "express";

import { loginUser, logoutUser, getCurrentUser, changePassword } from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

import { validateLogin, validateChangePassword } from "../validations/authValidation.js";

const authRouter = express.Router();

authRouter.post('/login', validateLogin, loginUser);

authRouter.post('/logout', authMiddleware, adminMiddleware, logoutUser);

authRouter.get('/me', authMiddleware, adminMiddleware, getCurrentUser);

authRouter.put('/change-password', validateChangePassword, authMiddleware, adminMiddleware, changePassword)

export default authRouter;

