import User from "../models/User.js";
import Outfit from "../models/Outfit.js";
import Item from "../models/Item.js";
import Trend from "../models/Trend.js";
import StyleTip from "../models/StyleTip.js";

export const getDashboardStats = async(req,res) => {
    try {
        
        const [
            totalOutfits,
            totalItems,
            totalTrends,
            totalStyleTips,
            totalUsers,
            recentOutfits
        ] = await Promise.all([
            Outfit.countDocuments({isActive: true}),
            Item.countDocuments({isActive: true}),
            Trend.countDocuments({isActive: true}),
            StyleTip.countDocuments({isActive: true}),
            User.countDocuments({role: "user"}),
            Outfit.find({isActive: true})
              .sort({createdAt: -1})
              .limit(5)
              .populate("occasion", "name")
              .populate("outfitType", "name")
              .select("title coverImage gender totalPrice createdAt"),
        ]);

        return res.status(200).json({success: true, stats: {totalOutfits, totalItems, totalTrends, totalStyleTips, totalUsers}, recentOutfits});

    } catch (error) {
         return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching dashboard stats",
            error: error.message,
        });
    }
}

export const getAllUsers = async(req,res) => {
    try {
        const users = await User.find({role: "user"}).select("-password").sort({createdAt: -1});

        return res.status(200).json({success: true, count: users.length, users});

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching users",
            error: error.message,
        });
    }
}