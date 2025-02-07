import dotenv from "dotenv";
import express from "express";
import { UserRouter } from "./routes/UserRoute.js";
import { IssueRouter } from "./routes/IssueRoute.js";
import { DBConnect } from "./utils/DB.js";
import { NgoRouter } from "./routes/NGORoute.js";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" })); // Allow all origins (for testing)
app.use(express.json());

// Routes
app.use("/api/users", UserRouter);
app.use("/api/issues", IssueRouter);
app.use("/api/ngos", NgoRouter); // Use the correct router

// Connect to DB and Start Server
DBConnect().then((res) => {
    if (res.success) {
        console.log(res.message);
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } else {
        console.error(res.message);
    }
});
