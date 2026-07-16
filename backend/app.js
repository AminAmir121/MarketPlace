const express = require("express");
const cors = require("cors");
const UserRouter = require("./router/UserRouter");


const app = express();
const PORT = 5000;


app.use(cors({
     origin: "http://localhost:3000",
     credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/uploads", express.static("uploads"));
app.use("/api/user", UserRouter);


app.listen(PORT, () => {
     console.log(`Server Running At http://localhost:${PORT}`);
})