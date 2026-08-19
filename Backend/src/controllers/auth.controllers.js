import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { sendEmail } from "../services/mail.service.js";
import { emailHtml, renderVerificationPage } from "../views/auth.view.js";



export const userRegisterController = async (req, res) =>{
    const {username, email, password} = req.body;

    // finding if the user is present based on their email or username
    const isUserAlreadyExists = await userModel.findOne({
        $or:[ {username}, {email} ]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "User with this email or username already exists.",
            success: false,
            err: "User already exists"
        })
    }

    // putting the data of the user onto the database
    const user = await userModel.create({username, email, password});

    
    const emailVerificationToken = jwt.sign({
        email: user.email
    }, process.env.JWT_SECRET)


    // sending email to the given email address
    await sendEmail({
        to: email,
        subject: "Welcome to Perplexity!",
        html: emailHtml({username, emailVerificationToken})
    })


    res.status(201).json({
        message: "User registered successfully.",
        success: true,
        user: {
            user_id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


export const userLoginController = async (req, res) => {
    const {email, password} = req.body;

    // checking if the user exists in the db
    const user = await userModel.findOne({email}).select('+password');

    if(!user){
        return res.status(400).json({
            message:"Invalid Email",
            success: false,
            err: "User not found"
        })
    }

    // checking if the passwords match
    const isPasswordMatch = await user.comparePassword(password);

    if(!isPasswordMatch){
        return res.status(400).json({
            message: "Invalid Password",
            success: false,
            err: "User not found"
        })
    }

    // creating a token containing the user data
    const token = jwt.sign({
        id: user._id,
        username: user.username
    }, process.env.JWT_SECRET, {expiresIn: '7d'})

    // setting the token in the cookies
    res.cookie("token", token);

    return res.status(200).json({
        message: "Login Successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


export const getMeController = async (req, res) =>{
    const userId = req.user.id;

    // checking if the user is present in the db 
    const user = await userModel.findById(userId);

    if(!user){
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}


export async function verifyEmail(req, res){
    // extracting the parameters sent in the url
    const {token} = req.query;

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({email: decoded.email});

        if(!user){
            return res.status(400).json({
                message: "Invalid Token",
                success: false,
                err: "User not Found"
            })
        }

        if(user.verified === true){
            return res.send(renderVerificationPage({
                eyebrow: "Account already active",
                title: "You’re already verified.",
                message: "Your email address has already been confirmed. You can continue straight to your Perplexity account.",
                icon: "✓"
            }))
        }

        user.verified = true;

        await user.save();

        return res.send(renderVerificationPage({
            eyebrow: "Email confirmed",
            title: "You’re all set.",
            message: "Your email has been verified successfully. Your Perplexity workspace is ready when you are.",
            icon: "✓"
        }))
        
    }catch(err){
        return res.status(400).json({
            message: "Invalid or expired Token",
            success: false,
            err: err.message
        })
    }
}

