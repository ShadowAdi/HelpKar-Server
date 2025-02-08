import mongoose from "mongoose";

export const DBConnect = async () => {
    const MONGODB_URI=process.env.MONGODB_URI
    try {
        if (!MONGODB_URI) {
            return {
                success: false,
                message: "Failed to connect to DB MONGODB_URI Do not Exists"
            };
        }
        await mongoose.connect(MONGODB_URI);

        return {
            success: true,
            message: "DB Connected"
        };
    } catch (error) {
        console.error("Error in connecting to MongoDB:", error);
        return {
            success: false,
            message: "Failed to connect to DB"
        };
    }
};
