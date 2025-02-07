import mongoose, { Types } from "mongoose";

const NGOModelSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String, // Person in charge of handling tasks
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    password: { type: String, required: true },
    address: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    issuesAssigned: {
        type: [Types.ObjectId],
        default: [],
        ref: "Issue"
    },
    issuesResolved: {
        type: [Types.ObjectId],
        default: [],
        ref: "Issue"
    },
    projectManager: {
        type: String,
        required: true
    },
    projectManagerEmail: {
        type: String,
    },
    socialMediaLinks: {
        facebook: { type: String },
        twitter: { type: String },
        linkedin: { type: String }
    },
    registeredDate: {
        type: Date,
        default: Date.now
    },
    badges: {
        type: [String], // List of earned badges
        default: []
    },
    languagePreference: {
        type: [String], // Languages spoken
        default: []
    },
    donationsReceived: {
        type: Number,
        default: 0
    },
    locationsWeWork: {
        areas: { type: [String], required: true },
        pincodes: { type: [String], required: true }
    },
    fieldsOnWeWork: {
        fields: {
            type: [String], required: true
        }
    },
  
    ngoProfile:{
        type:String,
        required:true
    }

}, {
    timestamps: true
});

export const NGOModel = mongoose.model("NGO", NGOModelSchema);
