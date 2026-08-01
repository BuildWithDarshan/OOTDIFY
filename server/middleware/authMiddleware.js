import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const authMiddleware = async (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided, authorization denied",
            });
        }

        const token = authHeader.split(" ")[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            const message = error.name === "TokenExpiredError" ? "Session expired, please log in again" : "Invalid token, authorization denied";
            return res.status(401).json({success: false, message});
        }

        const user = await User.findById(decoded.id);

        if(!user) {
            return res.status(401).json({success: false, message :"User belonging to this token no longer exists"});
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "This account has been deactivated",
            });
        }

        req.user = {id: user._id.toString(),role: user.role};

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in auth middleware",
            error: error.message,
        });
    }
}