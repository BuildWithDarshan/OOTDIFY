import express from "express";

import { registerUser, loginUser, logoutUser, getCurrentUser, changePassword } from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

import { validateRegister, validateLogin, validateChangePassword } from "../validations/authValidation.js";

const authRouter = express.Router();

authRouter.post('/register',validateRegister, registerUser);

authRouter.post('/login', validateLogin, loginUser);

authRouter.post('/logout', authMiddleware, logoutUser);

authRouter.get('/me', authMiddleware, getCurrentUser);

authRouter.put('/change-password', validateChangePassword, authMiddleware, changePassword)

export default authRouter;

