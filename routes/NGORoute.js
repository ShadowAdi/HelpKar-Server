import express from 'express'
import {  CreateNGO,  DeleteNGO, GetAccessOfIssue, GetAllNGOs, GetNGO, GetNgoNotifications, LoggedInNgoInfo, LoginNGO, ReadNgoNotifications, ResolvedIssue,  UpdateNGO } from
    '../controllers/NGOController.js'
import { NgoAuthCheck } from '../middleware/NgoAuthCheck.js'

export const NgoRouter = express.Router()

NgoRouter.get("/allNgos", GetAllNGOs)
NgoRouter.get("/allNgos/:NGOId", GetNGO)
NgoRouter.post("/create-ngo", CreateNGO)
NgoRouter.post("/login-ngo", LoginNGO)
NgoRouter.put("/update-ngo/", NgoAuthCheck, UpdateNGO)
NgoRouter.delete("/delete-ngo", NgoAuthCheck, DeleteNGO)
NgoRouter.put("/issue-access/:issueId", NgoAuthCheck, GetAccessOfIssue)
NgoRouter.put("/issue-resolved/:issueId", NgoAuthCheck, ResolvedIssue)
NgoRouter.get("/notifications", NgoAuthCheck, GetNgoNotifications)
NgoRouter.put("/read-notifications", NgoAuthCheck, ReadNgoNotifications)
NgoRouter.get("/loggedInNgo", NgoAuthCheck, LoggedInNgoInfo)