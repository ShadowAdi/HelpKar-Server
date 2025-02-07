import { IssueModel } from "../models/IssueModel.js"
import { NGOModel } from "../models/NGOModel.js"
import { NotificationModel } from "../models/NotificationModel.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const CreateNGO = async (req, res) => {
    try {
        const {
            organizationName, contactPerson, email, phoneNumber, address,
            projectManager, socialMediaLinks, languagePreference,
            projectManagerEmail, password, description, fieldsOnWeWork, locationsWeWork,
            ngoProfile
        } = req.body;

        if (!organizationName || !contactPerson || !email || !phoneNumber || !password || !projectManager || !description || !fieldsOnWeWork || !locationsWeWork) {
            return res.status(404).json({ message: "Data Not Given" });
        }

        if (!address.city || !address.state || !address.pincode) {
            return res.status(404).json({ message: "Location Data Not Given" });
        }

        const isNgoExists = await NGOModel.findOne({ email: email });
        if (isNgoExists) {
            return res.status(500).send({ message: "Ngo Already Exists" });
        }

        const newPassword = await bcrypt.hash(password, 10);

        const newNGOModel = new NGOModel({
            organizationName,
            contactPerson,
            email,
            phoneNumber,
            projectManager,
            socialMediaLinks,
            address,
            languagePreference,
            password: newPassword,
            projectManagerEmail,
            description,
            fieldsOnWeWork,  // ✅ Fix: Include fieldsOnWeWork
            locationsWeWork,  // ✅ Fix: Include locationsWeWork,
            ngoProfile
        });

        await newNGOModel.save()
            .then((data) => {
                if (!data) {
                    res.status(404).send({ message: `Not able to create NGO.` });
                } else {
                    res.status(201).send({ message: "NGO Created successfully." });
                }
            })
            .catch((err) => {
                res.status(500).send({ message: err.message || "Not Able To Create the NGO" });
            });

    } catch (error) {
        res.status(500).send({ message: error.message || "Not Able To Create the NGO" });
    }
};

export const LoginNGO = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).send({
                message: "Content Cannot Be Empty"
            })
        }

        const existedNgo = await NGOModel.findOne({ email: email })

        if (!existedNgo) {
            res.status(500).send({
                message: "Ngo Not Exists"
            });
        }

        const isPasswordCorrect = bcrypt.compare(password, existedNgo.password)
        if (!isPasswordCorrect) {
            res.status(500).send({
                message: "Incorrect Credentials"
            });
        }

        const token = jwt.sign({ ngoId: existedNgo._id, email: existedNgo.email }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.status(200).send({
            message: "Ngo Logged In Sucessfully",
            token: token,
            "role": "ngo"
        })
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while logging Ngo"
        });
    }
}

export const GetAllNGOs = async (req, res) => {
    try {
        const NGOs = await NGOModel.find()
        if (!NGOs) {
            res.status(404).send({
                message: "NGO Not Found"
            });
        }
        res.status(200).json(
            {
                data: NGOs,
                totalNGOCount: NGOs.length
            }
        )
    } catch (error) {
        res.status(404).send({
            message: error.message || "Not Able To get the NGO"
        });
    }
}

export const GetNGO = async (req, res) => {
    try {
        const NGOId = req.params.NGOId
        if (!NGOId) {
            res.status(404).send({
                message: "NGO Id Not Exists"
            });
        }
        const singleNgo = await NGOModel.findById(NGOId)
        return res.status(200).json({
            data: singleNgo
        })
    } catch (error) {
        res.status(404).send({
            message: error.message || "Not Able To get the NGO"
        });
    }
}

export const DeleteNGO = async (req, res) => {
    try {
        const { email, ngoId } = req.user
        const ngoExisted = await NGOModel.findOne({ email: email })

        if (!ngoExisted) {
            res.status(500).send({
                message: "Ngo Not Exists"
            });
        }

        if (ngoId !== ngoExisted._id.toString()) {
            res.status(500).send({
                message: "You Can Only Update Your Account"
            });
        }
        await NGOModel.findByIdAndDelete(ngoId).then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `Not able to delete NGO.`
                });
            } else {
                res.send({ message: "NGO deleted successfully." })
            }
        }).catch((err) => {
            res.status(404).send({
                message: err.message || "Not Able To delete the NGO"
            });
        })
    } catch (error) {
        res.status(500).send({
            message: err.message || "Not Able To delete the NGO"
        });
    }
}

export const UpdateNGO = async (req, res) => {
    try {
        const { email, ngoId } = req.user
        const ngoExisted = await NGOModel.findOne({ email: email })

        if (!ngoExisted) {
            res.status(500).send({
                message: "Ngo Not Exists"
            });
        }

        if (ngoId !== ngoExisted._id.toString()) {
            res.status(500).send({
                message: "You Can Only Update Your Account"
            });
        }

        const body = req.body
        await NGOModel.findByIdAndUpdate(ngoId, body, { new: true }).then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `Not able to update NGO.`
                });
            } else {
                res.send({ message: "NGO Updated successfully." })
            }
        }).catch((err) => {
            res.status(404).send({
                message: err.message || "Not Able To update the NGO"
            });
        })
    } catch (error) {
        res.status(500).send({
            message: err.message || "Not Able To update the NGO"
        });
    }
}

export const GetAccessOfIssue = async (req, res) => {
    try {
        const { email, ngoId } = req.user;
        const ngoExist = await NGOModel.findOne({ email: email });

        if (!ngoExist) {
            return res.status(404).send({ message: "NGO Not Exists" });
        }

        if (ngoId.toString() !== ngoExist._id.toString()) {
            return res.status(403).send({ message: "You have to login with your account" });
        }

        const issueId = req.params.issueId;
        if (!issueId) {
            return res.status(400).json({ message: "Issue Id Do Not Exists" });
        }

        const issueExists = await IssueModel.findById(issueId);
        if (!issueExists) {
            return res.status(404).json({ message: "Issue Do Not Exists" });
        }

        // Create a notification for the issue creator
        const notifications = [
            new NotificationModel({
                userId: issueExists.userId,
                recipientType: "User",  // Add this line
                isRead: false,
                description: `Issue is assigned to an NGO Name ${ngoExist.organizationName}`,
                isAboutIssue: true,
                issueId: issueExists._id,
                type: "Issue Update"
            })
        ];

        // Create notifications for issue followers
        notifications.push(
            ...issueExists.issueFollowers.map(issueFollowId =>
                new NotificationModel({
                    userId: issueFollowId,
                    recipientType: "User",  // Add this line
                    isRead: false,
                    description: `Issue is assigned to an NGO Name ${ngoExist.organizationName}`,
                    isAboutIssue: true,
                    issueId: issueExists._id,
                    type: "Issue Update"
                })
            )
        );

        await NotificationModel.insertMany(notifications);

        // Update issue details
        issueExists.assignedTo.ngoIds.push(ngoExist._id);
        issueExists.status = "In Progress";
        issueExists.notified = true;
        await issueExists.save();

        // Check if issue is already assigned
        if (ngoExist.issuesAssigned.includes(issueExists._id)) {
            return res.status(400).send({ message: "Issue already assigned to them", issueExists });
        }

        ngoExist.issuesAssigned.push(issueExists._id);
        await ngoExist.save();

        res.status(200).send({ message: "You get the access of Issue", issueExists });
    } catch (error) {
        res.status(500).send({ message: error.message || "Failed to get the issue to solved" });
    }
};

export const ResolvedIssue = async (req, res) => {
    try {
        const { resolutionDetails, solvedResolutionMedia, solvedUserIds } = req.body;
        const { email, ngoId } = req.user;
        const ngoExist = await NGOModel.findOne({ email: email });

        if (!ngoExist) {
            return res.status(404).send({ message: "NGO Not Exists" });
        }

        if (ngoId.toString() !== ngoExist._id.toString()) {
            return res.status(403).send({ message: "You have to login with your account" });
        }

        const issueId = req.params.issueId;
        if (!issueId) {
            return res.status(400).json({ message: "Issue Id Do Not Exists" });
        }

        const issueExists = await IssueModel.findById(issueId);
        if (!issueExists) {
            return res.status(404).json({ message: "Issue Do Not Exists" });
        }

        if (!issueExists.assignedTo.ngoIds.includes(ngoExist._id)) {
            return res.status(403).json({ message: "NGO Does Not Contain This Issue" });
        }

        // Update notifications for issue followers
        await Promise.all(issueExists.issueFollowers.map(async (issueFollowId) => {
            await NotificationModel.findOneAndUpdate(
                { userId: issueFollowId, issueId: issueExists._id },
                {
                    recipientType: "User",  // Add this line
                    description: `Issue is solved by NGO ${ngoExist.organizationName}`,
                    isAboutIssue: true,
                    issueId: issueExists._id,
                    type: "Resolution Update"
                },
                { upsert: true }
            );
        }));

        // Update issue details
        issueExists.resolutionDetails = resolutionDetails;
        issueExists.solvedResolutionMedia = solvedResolutionMedia;
        issueExists.solvedUserIds.push(ngoId, ...(Array.isArray(solvedUserIds) ? solvedUserIds : []));
        await issueExists.save();

        // Notify the issue creator
        await NotificationModel.findOneAndUpdate(
            { issueId: issueExists._id, userId: issueExists.userId },
            {
                recipientType: "User",  // Add this line
                description: `Issue is resolved by NGO ${ngoExist.organizationName}. Check the resolution details.`,
                type: "Resolution Update"
            },
            { upsert: true }
        );


        // Check if issue already marked as resolved
        if (ngoExist.issuesResolved.includes(issueExists._id)) {
            return res.status(400).send({ message: "Issue already resolved by this NGO" });
        }

        ngoExist.issuesResolved.push(issueExists._id);
        await ngoExist.save();

        res.status(200).send({ message: "Issue Is Resolved", issueExists });
    } catch (error) {
        res.status(500).send({ message: error.message || "Failed to resolve the issue" });
    }
};



export const GetNgoNotifications = async (req, res) => {
    try {
        const { email, ngoId } = req.user;

        const ngoExisted = await NGOModel.findOne({ email });
        if (!ngoExisted) {
            return res.status(404).send({ message: "NGO Not Exists" });
        }

        if (ngoId !== ngoExisted._id.toString()) {
            return res.status(403).send({ message: "Unauthorized access" });
        }

        await NotificationModel.find({ recipientType: "Ngo", userId: ngoExisted._id }).then((data) => {
            res.status(200).send({
                data: data,
                totalNotifications: data.length
            })
        }).catch(err => {
            res.status(404).send({
                message: err.message || "Some Error Occurred In Getting notification"
            });
        });
    } catch (error) {
        res.status(404).send({
            message: error.message || "Some Error Occurred In Getting Notification"
        });
    }
}

export const ReadNgoNotifications = async (req, res) => {
    try {
        const { email, ngoId } = req.user;

        const ngoExisted = await NGOModel.findOne({ email });
        if (!ngoExisted) {
            return res.status(404).send({ message: "NGO Not Exists" });
        }

        if (ngoId !== ngoExisted._id.toString()) {
            return res.status(403).send({ message: "Unauthorized access" });
        }

        // Fetch notifications and mark as read (optional)
        const notifications = await NotificationModel.find({ recipientType: "Ngo", userId: ngoExisted._id });

        // Optionally, mark notifications as read
        await NotificationModel.updateMany(
            { recipientType: "Ngo", userId: ngoExisted._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).send({
            data: notifications,
            totalNotifications: notifications.length
        });
    } catch (error) {
        res.status(404).send({
            message: error.message || "Some Error Occurred In Getting Notification"
        });
    }
};


export const LoggedInNgoInfo = async (req, res) => {
    try {
        const { email, ngoId } = req.user;

        const ngoExisted = await NGOModel.findById(ngoId);
        if (!ngoExisted) {
            return res.status(404).send({ message: "NGO Not Exists" });
        }

        if (ngoId !== ngoExisted._id.toString()) {
            return res.status(403).send({ message: "Unauthorized access" });
        }

        // Ensure the user is authorized
        if (ngoId !== ngoExisted._id.toString()) {
            return res.status(403).send({ message: "You have to log in with your account" });
        }

        res.status(200).json({
            "success": true,
            "ngo": ngoExisted
        })
    } catch (error) {
        console.log("Error ", error)
        res.status(404).json({
            "success": false,
            "error": error
        })
    }
}
