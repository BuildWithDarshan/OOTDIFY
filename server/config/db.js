import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database Connected Successfully: ${conn.connection.host}`);
        return conn.connection;
    } catch (error) {
        console.error("Database Connection failed:", error.message);
        throw error;
    }
};

export default connectDB;
