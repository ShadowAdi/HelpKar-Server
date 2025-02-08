import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { UserRouter } from "./routes/UserRoute.js";
import { IssueRouter } from "./routes/IssueRoute.js";
import { NgoRouter } from "./routes/NGORoute.js";
import { DBConnect } from "./utils/DB.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/users", UserRouter);
app.use("/api/issues", IssueRouter);
app.use("/api/ngos", NgoRouter);

// Connect to DB (Ensure DB connection happens before handling requests)
DBConnect().then((res) => {
    if (res.success) {
        console.log(res.message);
    } else {
        console.error(res.message);
    }
});


export default app;
