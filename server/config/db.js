import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database Connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;