import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import occasionRoutes from "./routes/occasionRoutes.js";
import outfitTypeRoutes from "./routes/outfitTypeRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";
import trendRoutes from "./routes/trendRoutes.js";
import styleTipRoutes from "./routes/styleTipRoutes.js";
import redirectRoutes from "./routes/redirectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import newsLetterRoutes from "./routes/newsLetterRoutes.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

let databaseConnection;

app.use(async (req, res, next) => {
    try {
        databaseConnection ||= connectDB();
        await databaseConnection;
        next();
    } catch (error) {
        databaseConnection = null;
        next(error);
    }
});

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Origin is not allowed by CORS"));
    },
}));

app.use(express.json())

app.use(cookieParser());

app.get('/',(req,res) =>   {
    res.send("OOTDIFY API is running");
});

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use('/api/auth', authRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/occasions', occasionRoutes);

app.use('/api/outfit-types', outfitTypeRoutes);

app.use('/api/items', itemRoutes);

app.use('/api/outfits', outfitRoutes);

app.use('/api/trends', trendRoutes);

app.use('/api/style-tips', styleTipRoutes);

app.use('/api/users', userRoutes);

app.use('/api/upload',uploadRoutes);

app.use('/api/redirect', redirectRoutes);

app.use('/api/newsletter', newsLetterRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
