import express from 'express'
import { CreateUser, DeleteUser, FindUser, FindUsers, FollowIssue, GetUserNotifications, GetUsersFollowedIssues, LoggedInUserInfo, LoginUser, ReadUserNotifications, UpdateUser } from '../controllers/UserController.js'
import { AuthCheck } from '../middleware/UserMiddleware.js'

export const UserRouter = express.Router()

UserRouter.post("/register", CreateUser)
UserRouter.post("/login", LoginUser)
UserRouter.put("/update", AuthCheck, UpdateUser)
UserRouter.delete("/delete", AuthCheck, DeleteUser)
UserRouter.get("/find", FindUsers)
UserRouter.get("/find/:id", FindUser)
UserRouter.put("/follow/:issueId", AuthCheck, FollowIssue)
UserRouter.get("/followedIssues/:issueId", GetUsersFollowedIssues)
UserRouter.get("/notifications", AuthCheck, GetUserNotifications)
UserRouter.put("/read-notifications", AuthCheck, ReadUserNotifications)
UserRouter.get("/loggedInUser", AuthCheck, LoggedInUserInfo)






