import express from "express";
import chats from "./data/data.js";
import * as dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { userRoutes } from "./routes/userRoutes.js";

const app = express();
dotenv.config();

connectDB();
app.use(express.json());// to accept json data
app.use(cors());

const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("<h1>Welcome to Chat App!!!</h1>");
})

app.use('/api/user', userRoutes);

// app.get("/api/chat", (req, res) => {
//     res.send(chats);
// })

// app.get("/api/chat/:id", (req, res) => {
//     const singleChat = chats.find((ele) => ele._id===req.params.id)
//     res.send(singleChat);
//    // console.log(req.params.id);
// })

app.listen(PORT, ()=> {
    console.log(`Server started on PORT ${PORT}`);
})