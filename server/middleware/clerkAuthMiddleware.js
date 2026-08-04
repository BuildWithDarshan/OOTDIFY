import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/User.js";

const buildDisplayName = (clerkUser, email) => {
    const fullName = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || clerkUser.username || email.split("@")[0];
};

export const clerkAuthMiddleware = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        let user = await User.findOne({ clerkUserId: userId });

        if (!user) {
            const clerkUser = await clerkClient.users.getUser(userId);
            const primaryEmail = clerkUser.emailAddresses.find(
                (address) => address.id === clerkUser.primaryEmailAddressId,
            );

            if (!primaryEmail || primaryEmail.verification?.status !== "verified") {
                return res.status(403).json({
                    success: false,
                    message: "A verified email address is required",
                });
            }

            const email = primaryEmail.emailAddress.toLowerCase();
            user = await User.findOne({ email });

            if (user?.role === "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Admin accounts must use the Admin login",
                });
            }

            if (user) {
                user.clerkUserId = userId;
                if (!user.name) user.name = buildDisplayName(clerkUser, email);
                await user.save();
            } else {
                user = await User.create({
                    clerkUserId: userId,
                    name: buildDisplayName(clerkUser, email),
                    email,
                    role: "user",
                });
            }
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "This account has been deactivated",
            });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
            clerkUserId: userId,
        };

        next();
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This email is already connected to another account",
            });
        }

        next(error);
    }
};
