export const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
 
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email, and password are all required",
        });
    }
 
    if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Name must be at least 2 characters",
        });
    }
 
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address",
        });
    }
 
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters",
        });
    }
 
    next();
};
 

export const validateLogin = async(req,res,next) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
        });
    }
    next();
}

export const validateChangePassword = async(req,res,next) => {
    const {currentPassword, newPassword} = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Current password and new password are both required",
        });
    }

    if(newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 6 characters",
        });
    }

    if(currentPassword === newPassword) {
        return res.status(400).json({
            success: false,
            message: "New password must be different from the current password",
        });
    }

    next();
}