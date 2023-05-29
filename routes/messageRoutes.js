import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/userModel.js';
import Chat from '../models/chatModel.js';
import Message from '../models/messageModel.js';

const router = express.Router();

router.post("/sendMessage", auth, async (req, res) => {
    const {content, chatId} = req.body;

    if(!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.status(400).send({
            message: "Invalid data passed into request"
        })
    }

    var newMessage = {
        sender: req.user._id,
        chat: chatId,
        content: content,
    }
    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name profile")
        message = await message.populate("chat")
        message = await User.populate(message, {
            path: "chat.users",
            select: "name profile email"
        })
        
        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        })
        
        res.json(message)
    }
    catch(error) {
        res.status(400).send(`Error occurred while sending message: {error}`);
    }
});

router.get("/fetchMessages/:chatId", auth, async (req, res) => {
    try {
        const messages = await Message.find({chat : req.params.chatId})
                                .populate("sender", "name profile email")
                                .populate("chat");
        res.json(messages);
    }
    catch (error) {
        res.status(400).send(`Error occurred while fetching messages: {error}`);
    }
})

export const messageRoutes = router;