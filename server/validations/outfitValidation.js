import mongoose from "mongoose";

const ALLOWED_GENDERS = ["men","women"];
const ALLOWED_SEASONS = ["summer","winter","monsoon","all-season"];

export const validateCreateOutfit = async(req,res,next) => {
    const { title, gender, occasion, outfitType, season, items } = req.body;

    if (!title || !gender || !occasion || !outfitType) {
        return res.status(400).json({
            success: false,
            message: "title, gender, occasion, and outfitType are all required",
        });
    }

    if(!ALLOWED_GENDERS.includes(gender)) {
        return res.status(400).json({
            success: false,
            message: `gender must be one of: ${ALLOWED_GENDERS.join(", ")}`,
        });
    }

    if(season !== undefined && !ALLOWED_SEASONS.includes(season)) {
        return res.status(400).json({
            success: false,
            message: `season must be one of: ${ALLOWED_SEASONS.join(", ")}`,
        });
    }

    if(!mongoose.Types.ObjectId.isValid(occasion)) {
        return res.status(400).json({
            success: false,
            message: "occasion must be a valid id",
        });
    }

    if(!mongoose.Types.ObjectId.isValid(outfitType)) {
        return res.status(400).json({
            success: false,
            message: "outfitType must be a valid id",
        });
    }

    if(!items) {
        return res.status(400).json({
            success: false,
            message: "items is required — a JSON array of item ids",
        });
    }

    let parsedItems;
    try {
        parsedItems = JSON.parse(items);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "items must be a valid JSON array of item ids",
        });
    }

    if(!Array.isArray(parsedItems) || parsedItems.length === 0) {
        return res.status(400).json({
            success: false,
            message: "items must be a non-empty array",
        });
    }

    const allValidIds = parsedItems.every((id) => mongoose.Types.ObjectId.isValid(id));
    if(!allValidIds) {
        return res.status(400).json({
            success: false,
            message: "One or more item ids are not valid",
        });
    }

    if(!req.file) {
        return res.status(400).json({
            success: false,
            message: "Cover image is required",
        });
    }

    next();
}

export const validateUpdateOutfit = async(req,res,next) => {
    const { gender, season, occasion, outfitType, items } = req.body;

    if (gender !== undefined && !ALLOWED_GENDERS.includes(gender)) {
        return res.status(400).json({
            success: false,
            message: `gender must be one of: ${ALLOWED_GENDERS.join(", ")}`,
        });
    }

    if (season !== undefined && !ALLOWED_SEASONS.includes(season)) {
        return res.status(400).json({
            success: false,
            message: `season must be one of: ${ALLOWED_SEASONS.join(", ")}`,
        });
    }

    if (occasion !== undefined && !mongoose.Types.ObjectId.isValid(occasion)) {
        return res.status(400).json({
            success: false,
            message: "occasion must be a valid id",
        });
    }

    if (outfitType !== undefined && !mongoose.Types.ObjectId.isValid(outfitType)) {
        return res.status(400).json({
            success: false,
            message: "outfitType must be a valid id",
        });
    }

    if(items !== undefined) {
        let parsedItems;
        try {
            parsedItems = JSON.parse(items);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "items must be a valid JSON array of item ids",
            });
        }
        if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "items must be a non-empty array",
            });
        }
        const allValidIds = parsedItems.every((id) => mongoose.Types.ObjectId.isValid(id));
        if (!allValidIds) {
            return res.status(400).json({
                success: false,
                message: "One or more item ids are not valid",
            });
        }
    }
    next();
}

