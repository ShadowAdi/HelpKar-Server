import mongoose from "mongoose";

export const DBConnect = async () => {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error("MONGODB_URI is missing.");
        return { success: false, message: "MONGODB_URI is missing." };
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully!");
        return { success: true, message: "DB Connected" };
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        return { success: false, message: "Failed to connect to DB" };
    }
};
