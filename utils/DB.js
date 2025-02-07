import mongoose from "mongoose";

export const DBConnect = async () => {
    try {
        await mongoose.connect("mongodb+srv://AdityaHubUser:isnPFyUOJtdz23qv@yogacluster.5vr9q.mongodb.net/helpkar?retryWrites=true&w=majority&appName=YogaCluster");

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
