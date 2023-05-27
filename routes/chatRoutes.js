import express from 'express';
import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

//API to access/create chat
router.post("/createChat", auth, async (req, res)=> {
    const {userId} = req.body;

    if(!userId) {
        return res.status(400).send({message: "userId param not sent with request"});
    }

    //checking if chat already exist or not
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            {users: {$elemMatch: {$eq: req.user._id}}},
            {users: {$elemMatch: {$eq: userId}}}
        ]
    }).populate("users","-password").populate("latestMessage");

    //trying to populate sender field of Message model present inside isChat
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name email profile"
    });

    //If chat exist send the chat as response
    if(isChat.length > 0){
        res.send(isChat[0]);
    }
    //If chat doesn't exist, create new chat with abouve details
    else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        }
        
        //storing the chat in DB
        try{
            const  newChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({_id: newChat._id}).populate("users","-password");
            res.status(200).send(FullChat);
        }
        catch(error) {
            res.status(400);
            throw new Error(error.message);
        }
    }

});

//Fetch chats of particular user
router.get("/fetchChats", auth, async (req, res) => {
    try {
        console.log(`${req.user}`);
        await Chat.find({users: {$elemMatch: {$eq: req.user._id}}})
                    .populate("users", "-passwords")
                    .populate("groupAdmin","-password")
                    .populate("latestMessage")
                    .sort({updatedAt: -1})
                    .then(async (results)=> {
                        results = await User.populate(results, {
                            path: "latestMessage.sender",
                            select: "name email profile"
                        });
                        res.status(200).send(results);
                    })
                  
    }
    catch(error) {
        res.send(error.message);
    }
});

//Creating group chat
router.post("/createGroupchat", auth, async (req, res) => {
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message: "Please fill all the feilds"})
    }

    var users = JSON.parse(req.body.users);

    if(users.length < 2) {
        return res.status(400).send({message: "Group chat requires more than 2 users"});
    }
    //pushing logged in user to group
    users.push(req.user);
    
    //storing chat in DB
    try{
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        });
        const fullGroupChat = await Chat.findOne({_id: groupChat._id})
                                        .populate("users", "-password")
                                        .populate("groupAdmin", "-password");
        res.status(200).send(fullGroupChat);
    }
    catch(error) {
        res.status(400).send(error.message);
    }
})

//Renaming Chat name
router.put("/renameGroup", async (req, res) => {
    const {chatId, newChatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: newChatName
        },
        {
            new: true,
        }
    )
    .populate("users","-password")
    .populate("groupAdmin", "-password")

    if(!updatedChat){
        res.status(404).send({message: "Chat not found"})
    }
    else {
        res.status(200).send(updatedChat);
    }
})

//Add user to group
router.put("/addToGroup", auth, async (req, res) => {
    const {chatId, userId} = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {users: userId},

        },
        {new: true}
    )
    .populate("users","-password")
    .populate("groupAdmin", "-password");
     
    if(!added){
        res.status(404).send({message: "Chat not found"})
    }
    else {
        res.status(200).send(added);
    }
    
})

//Remove user from group
router.put("/removeFromGroup",auth, async (req, res) => {
    const {chatId, userId} = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: {users: userId},

        },
        {new: true}
    )
    .populate("users","-password")
    .populate("groupAdmin", "-password");
     
    if(!removed){
        res.status(404).send({message: "Chat not found"})
    }
    else {
        res.status(200).send(removed);
    }
})



export const chatRoutes = router;
