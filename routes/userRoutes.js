import express from 'express';
import User from '../models/userModel.js';
import { generateToken } from '../config/generateToken.js';
import { generatePassword } from '../config/generatePassword.js';
import bcrypt from 'bcrypt';

const router = express.Router();

//User Singup
router.post("/signup", async (req, res) => {
    const {name, email, password, profile} = req.body;

    if(!name || !email || !password){
        res.status(400);
        throw new Error("Please Enter all the details");
    }

    const userExists = await User.findOne({email});

    if(userExists){
        res.status(400);
        throw new Error("User already exists");
    }
    const hashedPassword = await generatePassword(password);
    console.log(` Routes hashedPass: ${hashedPassword}`);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        profile
    })

    if(user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profile: user.profile,
            token: generateToken(user._id),
        });
    }
    else {
      res.status(400);
      throw new Error("Failed to create the user");  
    }
});

//User Login
router.post("/login", async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if(!user) {
        res.status(400).send({message: "Invalid Credentials"});
        return;
    }

    const storedPassword = user.password;
    const isPasswordMatch = await bcrypt.compare(password, storedPassword);
    if(!isPasswordMatch){
        res.status(400).send({message: "Invalid Credentials"});
        return;
    }

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        token: generateToken(user._id)
    });
     //res.status(200).send({message: "Successful Login!!!"})
})


export const userRoutes = router;