import { UserModel } from "../models/UserModel.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IssueModel } from "../models/IssueModel.js";
import { NotificationModel } from "../models/NotificationModel.js";

export const CreateUser = async (req, res) => {
    try {
        const { username, email, password, profilePicture, location, phoneNumber } = req.body

        if (!username || !email || !password || !phoneNumber) {
            res.status(400).send({
                message: "Content Cannot Be Empty"
            })
        }

        if (!location.city || location.state, !location.pincode) {
            res.status(400).send({
                message: "Please Give Your Location"
            })
        }

        const isUserExists = await UserModel.findOne({ email: email })
        if (isUserExists) {
            res.status(500).send({
                message: "User Already Exists"
            });
        }

        const newPassword = await bcrypt.hash(password, 10)

        const user = new UserModel({
            username: username,
            email: email,
            password: newPassword,
            phoneNumber: phoneNumber,
            location: location,
            profilePicture: profilePicture,
        })

        await user.save().then((data) => {
            res.status(201).send({
                message: "User Created Sucessfully",
                user: data
            })
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating user"
            });
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while creating user"
        });
    }
}

export const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).send({
                message: "Content Cannot Be Empty"
            })
        }

        const existedUser = await UserModel.findOne({ email: email })
        if (!existedUser) {
            res.status(500).send({
                message: "User Not Exists"
            });
        }

        const isPasswordCorrect = bcrypt.compare(password, existedUser.password)
        if (!isPasswordCorrect) {
            res.status(500).send({
                message: "Incorrect Credentials"
            });
        }

        const token = jwt.sign({ userId: existedUser._id, email: existedUser.email }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.status(200).send({
            message: "User Logged In Sucessfully",
            token: token,
            role: "user"
        })
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while logging user"
        });
    }
}

export const UpdateUser = async (req, res) => {
    try {
        const { username, profilePicture, location, phoneNumber, role, volunteerFields } = req.body
        const { email, userId } = req.user
        const userExisted = await UserModel.findOne({ email: email })

        if (!userExisted) {
            res.status(500).send({
                message: "User Not Exists"
            });
        }

        if (userId !== userExisted._id.toString()) {
            res.status(500).send({
                message: "You Can Only Update Your Account"
            });
        }

        await UserModel.findByIdAndUpdate(userId, {
            username,
            profilePicture,
            location,
            phoneNumber,
            role,
            volunteerFields
        }, {
            new: true
        }).then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `User not found.`
                });
            } else {
                res.send({ message: "User updated successfully." })
            }
        }).catch((err) => {
            res.status(500).send({
                message: err.message || "Not Able To Update the User"
            });
        })
    } catch (error) {
        res.status(500).send({
            message: error.message || "Not Able To Update the User"
        });
    }
}

export const DeleteUser = async (req, res) => {
    try {
        const { email, userId } = req.user
        const userExisted = await UserModel.findOne({ email: email })

        if (!userExisted) {
            res.status(500).send({
                message: "User Not Exists"
            });
        }

        if (userId !== userExisted._id.toString()) {
            res.status(500).send({
                message: "You Can Only Delete Your Account"
            });
        }

        await UserModel.findByIdAndDelete(userId).then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `User not found.`
                });
            } else {
                res.send({ message: "User deleted successfully." })
            }
        }).catch((err) => {
            res.status(500).send({
                message: err.message || "Not Able To delete the User"
            });
        })
    } catch (error) {
        res.status(500).send({
            message: error.message || "Not Able To delete the User"
        });
    }
}

export const FindUsers = async (req, res) => {
    try {
        const allUsers = await UserModel.find()

        if (!allUsers) {
            res.status(500).send({
                message: "User Not Found"
            });
        }

        return res.status(200).json({
            allUsers
        })
    } catch (error) {
        res.status(500).send({
            message: error.message || "Not Able To get the User"
        });
    }
}

export const FindUser = async (req, res) => {
    try {
        const userId = req.params.id
        const userFind = await UserModel.findById(userId)

        if (!userFind) {
            res.status(500).send({
                message: "User Not Found"
            });
        }

        return res.status(200).json({
            userFind
        })
    } catch (error) {
        res.status(500).send({
            message: error.message || "Not Able To get the User"
        });
    }
}

export const FollowIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const { email, userId } = req.user;

        const userExisted = await UserModel.findOne({ email: email });
        if (!userExisted) {
            return res.status(404).send({ message: "User Not Exists" });
        }

        if (userId !== userExisted._id.toString()) {
            return res.status(403).send({ message: "You have to login with your account" });
        }

        const issueFound = await IssueModel.findById(issueId);
        if (!issueFound) {
            return res.status(404).send({ message: "Issue Not Found" });
        }

        const isFollowing = userExisted.followedIssues.includes(issueId);

        if (isFollowing) {
            // Remove issue from user's followedIssues
            userExisted.followedIssues = userExisted.followedIssues.filter(id => id.toString() !== issueId);

            // Remove user from issue's followers
            issueFound.issueFollowers = issueFound.issueFollowers.filter(id => id.toString() !== userId);
            
            await userExisted.save();
            await issueFound.save();

            return res.status(200).send({ message: "Issue unfollowed successfully" });
        } else {
            // Add issue to user's followedIssues
            userExisted.followedIssues.push(issueId);

            // Add user to issue's followers
            issueFound.issueFollowers.push(userId);
            
            await userExisted.save();
            await issueFound.save();

            return res.status(200).send({ message: "Issue followed successfully" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message || "Unable to process the request" });
    }
};


export const GetUsersFollowedIssues = async (req, res) => {
    try {
        const { userId } = req.query
        const userExisted = await UserModel.findById(userId)

        if (!userExisted) {
            res.status(500).send({
                message: "User Not Exists"
            });
        }


        return res.status(200).json({
            issuesUserFollow: userExisted.followedIssues
        })

    } catch (error) {
        res.status(500).send({
            message: error.message || "Unable to process the request"
        });
    }
}



export const GetUserNotifications = async (req, res) => {
    try {
        const { email, userId } = req.user;

        const userExisted = await UserModel.findOne({ email });
        if (!userExisted) {
            return res.status(404).send({ message: "User Not Exists" });
        }

        if (userId !== userExisted._id.toString()) {
            return res.status(403).send({ message: "You have to log in with your account" });
        }

        await NotificationModel.find({ recipientType: "User", userId: userExisted._id }).then((data) => {
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

export const ReadUserNotifications = async (req, res) => {
    try {
        const { email, userId } = req.user;

        const userExisted = await UserModel.findOne({ email });
        if (!userExisted) {
            return res.status(404).send({ message: "User Not Exists" });
        }

        if (userId !== userExisted._id.toString()) {
            return res.status(403).send({ message: "You have to log in with your account" });
        }

        // Fetch notifications and mark as read (optional)
        const notifications = await NotificationModel.find({ recipientType: "User", userId: userExisted._id });

        // Optionally, mark notifications as read
        await NotificationModel.updateMany(
            { recipientType: "User", userId: userExisted._id, isRead: false },
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

export const LoggedInUserInfo = async (req, res) => {
    try {
        const { email, userId } = req.user;

        // Check if user exists
        const userExisted = await UserModel.findOne({ email });
        if (!userExisted) {
            return res.status(404).send({ message: "User Not Exists" });
        }

        // Ensure the user is authorized
        if (userId !== userExisted._id.toString()) {
            return res.status(403).send({ message: "You have to log in with your account" });
        }

        res.status(200).json({
            "success": true,
            "user": userExisted
        })
    } catch (error) {
        console.log("Error ", error)
        res.status(404).json({
            "success": false,
            "error": error
        })
    }
}
