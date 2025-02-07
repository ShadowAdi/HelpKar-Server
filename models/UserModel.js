import mongoose, { Types } from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String
    },
    issues: {
        type: [Types.ObjectId],
        default: [],
        ref: "Issue"
    },

    location: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    phoneNumber: {
        type: String,
        required:true
    },
    notifications: {
        type: [Types.ObjectId],
        default: [],
        ref: "Notification"
    },
    badges: {
        type: [String], 
        default: [],
    },
    followedIssues: {
        type: [Types.ObjectId], // Reference to issues the user is following
        ref: "Issue",
    },
}, {
    timestamps: true
})

export const UserModel = mongoose.model("User", UserSchema)