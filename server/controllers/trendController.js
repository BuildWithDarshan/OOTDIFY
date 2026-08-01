import Trend from "../models/Trend.js";
import Outfit from "../models/Outfit.js";
import {uploadImageToCloudinary, deleteImageCloudinary} from "../services/cloudinaryService.js";

export const createTrend = async(req,res) => {
    try {
        
        const {title, description, gender, stylingTips, relatedOutfits} = req.body;

        if(!title || !description) {
            return res.status(400).json({success: false, message: "title and description are required"});
        }

        if(!req.file) {
            return res.status(400).json({
                success: false,
                message: "Cover image is required",
            });
        }


        let parsedTips = [];
        if (stylingTips) {
            try {
                parsedTips = JSON.parse(stylingTips);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "stylingTips must be a valid JSON array of strings",
                });
            }
        }
        
        let parsedRelatedOutfits = [];
        if (relatedOutfits) {
            try {
                parsedRelatedOutfits = JSON.parse(relatedOutfits);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "relatedOutfits must be a valid JSON array of outfit ids",
                });
            }
 
            const foundCount = await Outfit.countDocuments({
                _id: { $in: parsedRelatedOutfits },
                isActive: true,
            });
            if (foundCount !== parsedRelatedOutfits.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more relatedOutfits could not be found or are inactive",
                });
            }
        }

        const {url, publicId} = await uploadImageToCloudinary(req.file.path, "/ootdify/trends");

        const trend = await Trend.create({
            title: title.trim(),
            coverImage: {url, publicId},
            description,
            gender: gender || "unisex",
            stylingTips: parsedTips,
            relatedOutfits: parsedRelatedOutfits,
        })

        return res.status(201).json({
            success: true,
            message: "Trend created successfully",
            trend,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the trend",
            error: error.message,
        });
    }
}

export const getTrends = async(req,res) => {
    try {
        
        const {gender} = req.query;

        const filter = {isActive: true};
        if(gender) filter.gender = gender;

        const trends = await Trend.find(filter).sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            count: trends.length,
            trends,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching trends",
            error: error.message,
        });
    }
}

export const getTrendById = async(req,res) => {
    try {
        
        const trend = await Trend.findById(req.params.id).populate({
            path: "relatedOutfits",
            select: "title coverImage gender totalPrice",
        });

        if(!trend || !trend.isActive) {
            return res.status(404).json({
                success: false,
                message: "Trend not found",
            });
        }

        return res.status(200).json({
            success: true,
            trend,
        });

    } catch (error) {
       if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Trend not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching the trend",
            error: error.message,
        }); 
    }
}

export const updateTrend = async(req,res) => {
    try {
        
        const trend = await Trend.findById(req.params.id);

        if(!trend) {
            return res.status(404).json({
                success: false,
                message: "Trend not found",
            });
        }

        const {title, description, gender, stylingTips, relatedOutfits, isActive} = req.body;

        if(title !== undefined) {
            trend.title = title.trim();
            trend.slug = undefined;
        }
        if (description !== undefined) trend.description = description;
        if (gender !== undefined) trend.gender = gender;
        if (isActive !== undefined) trend.isActive = isActive === "true";

        if(stylingTips !== undefined) {
            try {
                trend.stylingTips = JSON.parse(stylingTips);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "stylingTips must be a valid JSON array of strings",
                });
            }
        }

        if(relatedOutfits !== undefined) {
            let parsedRelatedOutfits;
            try {
                parsedRelatedOutfits = JSON.parse(relatedOutfits);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "relatedOutfits must be a valid JSON array of outfit ids",
                });
            }

            const foundCount = await Outfit.countDocuments({
                _id: {$in: parsedRelatedOutfits},
                isActive: true,
            });
            if(foundCount !== parsedRelatedOutfits.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more relatedOutfits could not be found or are inactive",
                });
            }
            trend.relatedOutfits = parsedRelatedOutfits;
        }

        if(req.file) {
            const oldPublidId = trend.coverImage?.publicId;
            const {url, publicId} = await uploadImageToCloudinary(req.file.path, "ootdify/trends");
            trend.coverImage = {url, publicId};
            await deleteImageCloudinary(oldPublidId);
        }

        await trend.save();

        return res.status(200).json({
            success: true,
            message: "Trend updated successfully",
            trend,
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Trend not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the trend",
            error: error.message,
        });
    }
}

export const deleteTrend = async(req,res) => {
    try {
        
        const trend = await Trend.findById(req.params.id);

        if(!trend) {
            return res.status(404).json({
                success: false,
                message: "Trend not found",
            });
        }

        trend.isActive = false;

        await trend.save();

        return res.status(200).json({
            success: true,
            message: "Trend deleted successfully",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Trend not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the trend",
            error: error.message,
        });
    }
}