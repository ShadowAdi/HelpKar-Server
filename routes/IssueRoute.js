import express from 'express'
import { AuthCheck } from '../middleware/UserMiddleware.js'
import { CreateIssue, DeleteIssue, DownvoteIssue, FindIssue, GetIssueFollowers, GetIssues, GetLocationBasedIssues, UpdateIssue, UpvoteIssue } from '../controllers/IssueController.js'

export const IssueRouter = express.Router()

IssueRouter.post("/issue", AuthCheck, CreateIssue)
IssueRouter.get("/issues", GetIssues)
IssueRouter.get("/issues/:issueId", FindIssue)
IssueRouter.put("/update-issue/:issueId", AuthCheck, UpdateIssue)
IssueRouter.delete("/delete-issue/:issueId", AuthCheck, DeleteIssue)
IssueRouter.put("/upvote/:issueId", AuthCheck, UpvoteIssue)
IssueRouter.put("/downvote/:issueId", AuthCheck, DownvoteIssue)
IssueRouter.get("/issueFollowers/:issueId", GetIssueFollowers)
IssueRouter.get("/issues-location-based", GetLocationBasedIssues)