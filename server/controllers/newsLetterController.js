import Subscriber from "../models/Subscriber.js";

export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existing = await Subscriber.findOne({ email: normalizedEmail });

        if (existing) {
            if (existing.isActive) {
                return res.status(409).json({ success: false, message: "This email is already subscribed" });
            }
            // Re-subscribe a previously unsubscribed email instead of creating a duplicate
            existing.isActive = true;
            await existing.save();
            return res.status(200).json({ success: true, message: "Welcome back! You're subscribed again." });
        }

        await Subscriber.create({ email: normalizedEmail });

        return res.status(201).json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "This email is already subscribed" });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while subscribing",
            error: error.message,
        });
    }
};

// Admin-only: list all active subscribers
export const getSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find({ isActive: true }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: subscribers.length,
            subscribers,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching subscribers",
            error: error.message,
        });
    }
};

// Admin-only: unsubscribe someone manually (soft delete, consistent with rest of the app)
export const removeSubscriber = async (req, res) => {
    try {
        const subscriber = await Subscriber.findById(req.params.id);

        if (!subscriber || !subscriber.isActive) {
            return res.status(404).json({ success: false, message: "Subscriber not found" });
        }

        subscriber.isActive = false;
        await subscriber.save();

        return res.status(200).json({ success: true, message: "Subscriber removed" });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({ success: false, message: "Subscriber not found" });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while removing the subscriber",
            error: error.message,
        });
    }
};