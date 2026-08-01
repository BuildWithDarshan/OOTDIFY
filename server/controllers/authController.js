import User from "../models/User.js";
import jwt from "jsonwebtoken"

export const registerUser = async (req,res) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({success: false,message:"Name, email, password, all are required"});
        }

        if(password.length < 6) {
            return res.status(400).json({success: false, message: "Password must be atleast 6 characters"});
        }

        const existingUser = await User.findOne({email: email.toLowerCase().trim()});
        if(existingUser) {
            return res.status(409).json({success: false, message: "An account with this email already exist"});
        }

        const user = await User.create({name, email, password});

        const token = jwt.sign({id: user._id, role: user.role,}, process.env.JWT_SECRET,{expiresIn: "7d"});

        return res.status(201).json({success: true, message: "Account created successfully", user: {id: user._id, name: user.name, email: user.email, role: user.role}, token});

    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong while registering to user", error: error.message});
    }
}

export const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({success: false,message:"Email and password are required"});
        }

        const user = await User.findOne({email: email.toLowerCase().trim()}).select("+password");

        if(!user) {
            return res.status(401).json({success: false, message: "Invalid email or password",}); 
        }

        if(!user.isActive) {
            return res.status(403).json({success: false, message: "This account has been deactivated"});
        }

        const isMatch = await user.comparePassword(password);

        if(!isMatch) {
            return res.status(401).json({success: false, message: "Invalid email or password"});
        }

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET,{expiresIn: "7d"});

        return res.status(201).json({success: true, message: "Logged in successfully", user: {id: user._id, name: user.name, email: user.email, role: user.role}, token});

    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong while logging in", error: error.message});
    }
}

export const logoutUser = async (req,res) => {
    try {
       return res.status(200).json({success: true, message:"Logged out Successfully"}); 
    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong while logging out", error: error.message});
    }
}

export const getCurrentUser = async (req,res) => {
    try {
        const user = await User.findById(req.user.id);

        if(!user) {
            return res.status(404).json({success: false, message: "User not found"});
        }

        return res.status(200).json({success: true, user: {id: user._id, name: user.name, email: user.email, role: user.role, preferredGender: user.preferredGender, preferredBudget: user.preferredBudget, favourites: user.favourites,}});

    } catch (error) {
        return res.status(500).json({success: false, message: "Something went wrong while fetching current user", error: error.message});
    }
}

export const changePassword = async (req,res) => {
    try {
        const {currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword) {
            return res.status(400).json({success: false, message: "Current password and new password are both required"});
        }

        if(newPassword.length < 6) {
            return res.status(400).json({success: false, message: "New password must be at least 6 characters"});
        }

        const user = await User.findById(req.user.id).select("+password");

        if(!user) {
            return res.status(404).json({success: false, message: "User not found"});
        }

        const isMatch = await user.comparePassword(currentPassword);

        if(!isMatch) {
            return res.status(401).json({success: false, message: "Current password is incorrect"});
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({success:true, message: "Password changed successfully"});
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while changing the password",
            error: error.message,
        });
    }
}