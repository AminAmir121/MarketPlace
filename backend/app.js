require("dotenv").config();
const express = require("express");
const cors = require("cors");
const UserRouter = require("./router/UserRouter");


const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
     .split(",")
     .map((origin) => origin.trim());

app.use(cors({
     origin: allowedOrigins,
     credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/uploads", express.static("uploads"));
app.use("/api/user", UserRouter);


app.listen(PORT, () => {
     console.log(`Server Running At http://localhost:${PORT}`);
})