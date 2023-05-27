import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const auth = async (req, res, next) => {
    let token;
    console.log(`request obj1: ${req.user}`);

    if(
        req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(`decoded: ${JSON.stringify(decoded)}`);
            req.user = await User.findById(decoded.id).select("-password");
            console.log(`request obj1: ${req.user}`);
            next();
        }
        catch(err) {
            res.status(401).send({message: "Not authorized, token failed"});
            return;
            //throw new Error("Not authorized, token failed");
        
        }
    }
    else{
        res.status(401).send({ message: "Not authorized, token missing" });
        return;
    }
}