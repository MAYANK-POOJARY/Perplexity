import jwt from "jsonwebtoken"

export function authUser (req, res, next){

    // getting the token from the cookies
    const token = req.cookies.token;

    if(!token){
        return res.status().json({
            message:"Unauthorized",
            success: false,
            err: "No token provided"
        })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next()
}