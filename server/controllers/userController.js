import User from "../models/User.js";
import Outfit from "../models/Outfit.js";

export const updateProfile = async(req,res) => {
    try {
        
        const {name, preferredGender, preferredBudget} = req.body;

        const user = await User.findById(req.user.id);

        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if(name !== undefined) user.name = name.trim();
        if(preferredGender !== undefined) user.preferredGender = preferredGender;
        if(preferredBudget !== undefined) {
            const parsedBudget = Number(preferredBudget);
            if(isNaN(preferredBudget) || preferredBudget < 0) {
                return res.status(400).json({success: false, message: "preferredBudget must be a valid non-negative number"});
            }
            user.preferredBudget = parsedBudget;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                preferredGender: user.preferredGender,
                preferredBudget: user.preferredBudget,
            }
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the profile",
            error: error.message,
        });
    }
}

export const getFavourites = async(req,res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: "favourites",
            match: {isActive: true},
            populate: [
                {path: "occasion", select: "name slug"},
                {path: "outfitType", select: "name slug"}, 
            ],
        });

        if(!user) {
            return res.status(404).json({success: false, message: "User not found"});
        }

        return res.status(200).json({success: true, count: user.favourites.length, favourites: user.favourites});

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching favourites",
            error: error.message,
        });
    }
}

export const addFavourite = async(req,res) => {
    try {
        
        const {outfitId} = req.params;

        const outfit = await Outfit.findById(outfitId);
        if(!outfit || !outfit.isActive) {
            return res.status(404).json({
                success: false,
                message: "Outfit not found",
            });
        }

        const user = await User.findById(req.user.id);

        const alreadyFavourited = user.favourites.some(
            (id) => id.toString() === outfitId
        );

        if(alreadyFavourited) {
            return res.status(409).json({success: false, message: "Outfit is already in favourites"});
        }

        user.favourites.push(outfitId);

        await user.save();

        return res.status(200).json({success: true, message: "Outfit added to favourites", favourites: user.favourites});

    } catch (error) { 
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Outfit not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while adding to favourites",
            error: error.message,
        });
    }
}

export const removeFavourite = async(req, res) => {
    try {
        
        const {outfitId} = req.params;

        const user = await User.findById(req.user.id);

        const wasFavourited = user.favourites.some(
            (id) => id.toString() === outfitId
        );

        if(!wasFavourited) {
            return res.status(404).json({success: false, message: "Outfit is not in favourites"});
        }

        user.favourites = user.favourites.filter(
            (id) => id.toString() !== outfitId
        );

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Outfit removed from favourites",
            favourites: user.favourites,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while removing from favourites",
            error: error.message,
        });
    }
}