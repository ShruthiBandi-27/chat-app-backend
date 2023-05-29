import express from "express";
import chats from "./data/data.js";
import * as dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { userRoutes } from "./routes/userRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";
import { Server } from "socket.io";

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
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);


const server = app.listen(PORT, ()=> {
    console.log(`Server started on PORT ${PORT}`);
})

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "https://64747ed59837776c3e41d385--stunning-crepe-ec7e54.netlify.app/",
    }
})

io.on("connection", (socket) => {
    console.log("connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected");
    })

    socket.on("join chat", (room) =>{
        socket.join(room);
        console.log("User joined room: " + room)
    })

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if(!chat.users) return console.log("chat.users not defined")
        
        chat.users.forEach((user) => {
            if(user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received",newMessageReceived);
        })
    })

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    })
}) 