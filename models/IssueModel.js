import mongoose, { Schema, Types } from "mongoose";

const IssueSchema = new Schema(
  {
    issueMedia: { type: [String], default: [] },
    issueName: { type: String, required: true },
    issueDescription: { type: String, required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    upvotes: { type: [Types.ObjectId], default: [] },
    downvotes: { type: [Types.ObjectId], default: [] },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    cityLocation: { type: String, required: true },
    stateLocation: { type: String, required: true },
    locationPincode: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (value) {
            return Array.isArray(value) && value.length === 2;
          },
          message: "Coordinates must be an array of two numbers [longitude, latitude].",
        },
      },
    },
    notified: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ["Road", "Water", "Electricity", "Sanitation", "Others"],
      required: true,
    },
    threatLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    assignedTo: {
      ngoIds: { type: [Types.ObjectId], ref: "NGO", default: [] },
    },
    resolutionDetails: { type: String },
    solvedResolutionMedia: { type: [String],default: []  },
    solvedUserIds: { type: [Types.ObjectId], default: [] },
    issueFollowers: { type: [Types.ObjectId], default: [] },
  },
  { timestamps: true }
);

// Create geospatial index
IssueSchema.index({ location: "2dsphere" });

export const IssueModel = mongoose.model("Issue", IssueSchema);