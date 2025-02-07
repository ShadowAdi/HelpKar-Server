import mongoose, { Types } from "mongoose";

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: Types.ObjectId,
        required: true,
        refPath: "recipientType"
    },
    recipientType: {
        type: String,
        required: true,
        enum: ["User", "NGO"]
    },
    isRead: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: true
    },
    isAboutIssue: {
        type: Boolean,
        default: false
    },
    issueId: {
        type: Types.ObjectId,
        ref: "Issue"
    },
    type: {
        type: String,
        enum: ["Issue Update", "Volunteer Request", "Resolution Update", "General Info"],
        required: true
    }
}, { timestamps: true });

export const NotificationModel = mongoose.model("Notification", NotificationSchema);
