import { IssueModel } from "../models/IssueModel.js";
import { NGOModel } from "../models/NGOModel.js";
import { UserModel } from "../models/UserModel.js";

export const CreateIssue = async (req, res) => {
    try {
        const {
            issueMedia, issueName, issueDescription,
            cityLocation, stateLocation, locationPincode, category,
            incidentCategory, location
        } = req.body;

        const { email, userId } = req.user;
        const userExisted = await UserModel.findOne({ email: email });

        if (!userExisted) {
            return res.status(404).send({
                message: "User Not Exists"
            });
        }

        if (userId !== userExisted._id.toString()) {
            return res.status(403).send({
                message: "Login With your account"
            });
        }

        // Ensure location has correct structure
        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).send({
                message: "Invalid location format. Must contain type 'Point' and coordinates [longitude, latitude]."
            });
        }

        // Create a new issue with correct location structure
        const issue = new IssueModel({
            issueName,
            issueDescription,
            issueMedia,
            category,
            cityLocation,
            stateLocation,
            locationPincode,
            incidentCategory,
            userId,
            location: {
                type: "Point",
                coordinates: location.coordinates, // Ensure this is an array of two numbers [longitude, latitude]
            }
        });

        // Save the issue
        const savedIssue = await issue.save();

        // Update the user document to add the issue to their list
        await UserModel.findByIdAndUpdate(userId, {
            $push: { issues: savedIssue._id }
        });

        res.status(201).send({
            message: "Issue Created Successfully",
            issue: savedIssue
        });

    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while creating issue"
        });
    }
};

export const FindIssue = async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const issue = await IssueModel.findById(issueId)
            .populate("userId", "username email profilePicture phoneNumber") // Fetch user name & email
            .populate("assignedTo.ngoIds", "organizationName contactPerson email  phoneNumber address.city address.state  address.pincode _id  "); // Fetch NGO details

        if (!issue) {
            return res.status(404).json({ message: "Issue Not Found" });
        }

        return res.status(200).json({ issue });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Not able to find the issue",
        });
    }
};


export const GetIssues = async (req, res) => {
    try {
        const findIssues = await IssueModel.find()
            .populate('userId', 'name email')
            .populate('assignedTo.ngoIds', 'name');

        if (!findIssues || findIssues.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Issues Found"
            });
        }

        return res.status(200).json({
            success: true,
            issues: findIssues,
            totalIssues: findIssues.length
        });
    } catch (error) {
        console.error("Error in GetIssues:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Unable to fetch issues",
            error: error
        });
    }
};

export const DeleteIssue = async (req, res) => {
    try {
        const issueId = req.params.issueId
        const FindIssue = await IssueModel.findById(issueId)

        if (!FindIssue) {
            res.status(500).send({
                message: "Issue Not Found"
            });
        }

        const { email, userId } = req.user
        const userExisted = await UserModel.findOne({ email: email })

        if (!userExisted) {
            res.status(500).send({
                message: "User Not Exists"
            });
        }

        if (userId !== userExisted._id.toString()) {
            res.status(500).send({
                message: "Login With your account"
            });
        }

        if (FindIssue.userId.toString() !== userId) {
            res.status(500).send({
                message: "Login With your account"
            });
        }

        await IssueModel.findByIdAndDelete(issueId).then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `Issue not found.`
                });
            } else {
                res.status(200).send({ message: "Issue deleted successfully." })
            }
        }).catch((err) => {
            res.status(500).send({
                message: err.message || "Not Able To delete the Issue"
            });
        })

    } catch (error) {
        res.status(500).send({
            message: error.message || "Not Able To find the issue"
        });
    }
}

export const UpdateIssue = async (req, res) => {
    try {
        const issueData = req.body
        const { issueId } = req.params

        const { email, userId } = req.user
        const userExisted = await UserModel.findOne({ email: email })

        if (!userExisted) {
            res.status(500).send({
                message: "User Not Exists"
            });
        }

        if (userId !== userExisted._id.toString()) {
            res.status(500).send({
                message: "Login With your account"
            });
        }

        const FindIssue = await IssueModel.findById(issueId)

        if (!FindIssue) {
            res.status(500).send({
                message: "Issue Not Found"
            });
        }

        if (FindIssue.userId.toString() !== userId) {
            res.status(500).send({
                message: "Login With Your Account"
            });
        }

        await IssueModel.findByIdAndUpdate(issueId, issueData, { new: true }).then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `Issue not found.`
                });
            } else {
                res.send({ message: "Issue updated successfully." })
            }
        }).catch((err) => {
            res.status(500).send({
                message: err.message || "Not Able To Update the Issue"
            })
        })
    } catch (error) {
        res.status(500).send({
            message: error.message || "Not Able To Update the Issue"
        });
    }
}

export const UpvoteIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { email, userId } = req.user;

        const userExisted = await UserModel.findOne({ email });
        if (!userExisted) {
            return res.status(404).send({ message: "User does not exist" });
        }

        if (userId !== userExisted._id.toString()) {
            return res.status(403).send({ message: "Unauthorized action" });
        }

        const issue = await IssueModel.findById(issueId);
        if (!issue) {
            return res.status(404).send({ message: "Issue not found" });
        }

        const isUpvoted = issue.upvotes.includes(userId);
        const isDownvoted = issue.downvotes.includes(userId);

        // Remove downvote if user is upvoting
        if (isDownvoted) {
            issue.downvotes = issue.downvotes.filter((id) => id.toString() !== userId);
        }

        // Toggle upvote
        if (isUpvoted) {
            issue.upvotes = issue.upvotes.filter((id) => id.toString() !== userId);
        } else {
            issue.upvotes.push(userId);
        }

        await issue.save();
        res.status(200).send({ message: "Upvote status updated", issue });
    } catch (error) {
        res.status(500).send({ message: error.message || "Failed to update upvote status" });
    }
};

export const DownvoteIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { email, userId } = req.user;

        const userExisted = await UserModel.findOne({ email });
        if (!userExisted) {
            return res.status(404).send({ message: "User does not exist" });
        }

        if (userId !== userExisted._id.toString()) {
            return res.status(403).send({ message: "Unauthorized action" });
        }

        const issue = await IssueModel.findById(issueId);
        if (!issue) {
            return res.status(404).send({ message: "Issue not found" });
        }

        const isUpvoted = issue.upvotes.includes(userId);
        const isDownvoted = issue.downvotes.includes(userId);

        // Remove upvote if user is downvoting
        if (isUpvoted) {
            issue.upvotes = issue.upvotes.filter((id) => id.toString() !== userId);
        }

        // Toggle downvote
        if (isDownvoted) {
            issue.downvotes = issue.downvotes.filter((id) => id.toString() !== userId);
        } else {
            issue.downvotes.push(userId);
        }

        await issue.save();
        res.status(200).send({ message: "Downvote status updated", issue });
    } catch (error) {
        res.status(500).send({ message: error.message || "Failed to update downvote status" });
    }
};

export const UpvoteIssueNGO = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { email, ngoId } = req.user;

        const ngoExist = await NGOModel.findOne({ email });
        if (!ngoExist) {
            return res.status(404).send({ message: "NGO does not exist" });
        }

        if (ngoId !== ngoExist._id.toString()) {
            return res.status(403).send({ message: "Unauthorized action" });
        }

        const issue = await IssueModel.findById(issueId);
        if (!issue) {
            return res.status(404).send({ message: "Issue not found" });
        }

        const isUpvoted = issue.upvotes.includes(ngoId);
        const isDownvoted = issue.downvotes.includes(ngoId);

        // Remove downvote if NGO is upvoting
        if (isDownvoted) {
            issue.downvotes = issue.downvotes.filter((id) => id.toString() !== ngoId);
        }

        // Toggle upvote
        if (isUpvoted) {
            issue.upvotes = issue.upvotes.filter((id) => id.toString() !== ngoId);
        } else {
            issue.upvotes.push(ngoId);
        }

        await issue.save();
        res.status(200).send({ message: "Upvote status updated", issue });
    } catch (error) {
        res.status(500).send({ message: error.message || "Failed to update upvote status" });
    }
};

export const DownvoteIssueNGO = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { email, ngoId } = req.user;

        const ngoExist = await NGOModel.findOne({ email });
        if (!ngoExist) {
            return res.status(404).send({ message: "NGO does not exist" });
        }

        if (ngoId !== ngoExist._id.toString()) {
            return res.status(403).send({ message: "Unauthorized action" });
        }

        const issue = await IssueModel.findById(issueId);
        if (!issue) {
            return res.status(404).send({ message: "Issue not found" });
        }

        const isUpvoted = issue.upvotes.includes(ngoId);
        const isDownvoted = issue.downvotes.includes(ngoId);

        // Remove upvote if NGO is downvoting
        if (isUpvoted) {
            issue.upvotes = issue.upvotes.filter((id) => id.toString() !== ngoId);
        }

        // Toggle downvote
        if (isDownvoted) {
            issue.downvotes = issue.downvotes.filter((id) => id.toString() !== ngoId);
        } else {
            issue.downvotes.push(ngoId);
        }

        await issue.save();
        res.status(200).send({ message: "Downvote status updated", issue });
    } catch (error) {
        res.status(500).send({ message: error.message || "Failed to update downvote status" });
    }
};

export const GetIssueFollowers = async (req, res) => {
    try {
        const { issueId } = req.params;

        const issue = await IssueModel.findById(issueId);
        if (!issue) {
            return res.status(404).send({ message: "Issue not found" });
        }

        return res.status(200).json({
            issueFollowers: issue.issueFollowers
        })

    } catch (error) {
        res.status(500).send({ message: error.message || "Failed to update downvote status" });
    }
}

export const GetLocationBasedIssues = async (req, res) => {
    try {
        const { latitude, longitude, radius = 5000 } = req.query; // radius in meters, default 5km

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and Longitude are required"
            });
        }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lon)) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude"
            });
        }

        const nearbyIssues = await IssueModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lon, lat] // MongoDB uses [longitude, latitude] order
                    },
                    $maxDistance: radius // in meters
                }
            }
        }).populate('userId', 'email');

        res.json({
            success: true,
            issues: nearbyIssues,
            totalIssues: nearbyIssues.length
        });
    } catch (error) {
        console.error("Error fetching nearby issues:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};