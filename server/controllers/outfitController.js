import Outfit from "../models/Outfit.js";
import OutfitType from "../models/OutfitType.js";
import Occasion from "../models/Occasion.js";
import Item from "../models/Item.js";
import { uploadImageToCloudinary, deleteImageCloudinary } from "../services/cloudinaryService.js";

const validateItemsAndGetTotal = async(itemIds) => {
    if(!Array.isArray(itemIds) || itemIds.length === 0) {
        throw new Error("At least one item is required to build an outfit");
    }

    const items = await Item.find({_id: { $in: itemIds}, isActive: true});

    if(items.length !== itemIds.length) {
        throw new Error("One or more items could not be found or are inactive");
    }

    const totalPrice = items.reduce((sum,item) => sum + item.price, 0);
    return totalPrice;
}

export const createOutfit = async(req,res) => {
    try {
        
        const {title, gender, occasion, outfitType, season, description, items, isOOTD, isTrending, isCelebrityInspired, inspiredByLabel} = req.body;

        if(!title || !gender || !occasion || !outfitType) {
            return res.status(400).json({success: false, message: "title, gender, occasion, and outfitType are all required"});
        }

        if(!req.file) {
            return res.status(400).json({success: false, message: "Cover image is required"});
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

        const [occasionDoc, outfitTypeDoc] = await Promise.all([
            Occasion.findById(occasion),
            OutfitType.findById(outfitType),
        ]);

        if(!occasionDoc || !occasionDoc.isActive) {
            return res.status(400).json({ success: false, message: "Invalid occasion" });
        }

        if (!outfitTypeDoc || !outfitTypeDoc.isActive) {
            return res.status(400).json({ success: false, message: "Invalid outfit type" });
        }

        let totalPrice;
        try {
            totalPrice = await validateItemsAndGetTotal(parsedItems);
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const {url, publicId} = await uploadImageToCloudinary(req.file.path, "ootdify/outfits");

        const outfit = await Outfit.create({
            title: title.trim(),
            coverImage: {url, publicId},
            gender,
            occasion,
            outfitType,
            season: season || "all-season",
            items: parsedItems,
            totalPrice,
            description,
            isTrending: isTrending === "true",
            isCelebrityInspired: isCelebrityInspired === "true",
            inspiredByLabel: inspiredByLabel?.trim(),
        })

        if(isOOTD === "true") {
            await Outfit.updateMany(
                {gender, isOOTD: true},
                {isOOTD: false, ootdDate: null}
            );
            outfit.isOOTD = true;
            outfit.ootdDate = new Date();
            await outfit.save();
        }

        return res.status(201).json({
            success: true,
            message: "Outfit created successfully",
            outfit,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the outfit",
            error: error.message,
        });
    }
}

export const getOutfits = async(req,res) => {
    try {
        
        const {gender, occasion, outfitType, season, minPrice, maxPrice, search, isTrending, isOOTD,  isCelebrityInspired} = req.query;

        const filter = {isActive: true};
        if(gender) filter.gender = gender;
        if (occasion) filter.occasion = occasion;
        if (outfitType) filter.outfitType = outfitType;
        if (season) filter.season = season;
        if (isTrending !== undefined) filter.isTrending = isTrending === "true";
        if (isCelebrityInspired !== undefined) filter.isCelebrityInspired = isCelebrityInspired === "true";
        if (isOOTD !== undefined) filter.isOOTD = isOOTD === "true";

        if (search?.trim()) {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchPattern = new RegExp(escapedSearch, "i");
            filter.$or = [
                {title: searchPattern},
                {description: searchPattern},
                {inspiredByLabel: searchPattern},
            ];
        }

        if(minPrice || maxPrice) {
            filter.totalPrice = {};
            if(minPrice) filter.totalPrice.$gte = Number(minPrice);
            if(maxPrice) filter.totalPrice.$lte = Number(maxPrice);
        }

        const outfits = await Outfit.find(filter).sort({createdAt: -1}).populate("occasion", "name slug").populate("outfitType", "name slug");

        return res.status(200).json({
            success: true,
            count: outfits.length,
            outfits,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching outfits",
            error: error.message,
        });
    }
}

export const getOutfitById = async(req,res) => {
    try {
        
        const outfit = await Outfit.findById(req.params.id).populate("occasion", "name slug").populate("outfitType","name slug").populate("items");    

        if(!outfit || !outfit.isActive){
            return res.status(404).json({success: false, message: "Outfit Not found"});
        }

        return res.status(200).json({success: true, outfit});

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Outfit not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching the outfit",
            error: error.message,
        });
    }
}

export const updateOutfit = async(req,res) => {
    try {
        
        const outfit =  await Outfit.findById(req.params.id);

        if(!outfit) {
            return res.status(404).json({success: false, message: "Outfit Not found"});
        }

        const {title, gender, occasion, outfitType, season, description, items, isTrending,isCelebrityInspired, inspiredByLabel, isActive} = req.body;

        if(title !== undefined) outfit.title = title.trim();
        if (gender !== undefined) outfit.gender = gender;
        if (season !== undefined) outfit.season = season;
        if (description !== undefined) outfit.description = description;
        if (isTrending !== undefined) outfit.isTrending = isTrending === "true";
        if (isCelebrityInspired !== undefined) outfit.isCelebrityInspired = isCelebrityInspired === "true";
        if (inspiredByLabel !== undefined) outfit.inspiredByLabel = inspiredByLabel.trim();
        if (isActive !== undefined) outfit.isActive = isActive === "true";

        if(occasion !== undefined) {
            const occasionDoc = await Occasion.findById(occasion);
            if(!occasionDoc || !occasionDoc.isActive) {
                return res.status(400).json({ success: false, message: "Invalid occasion" });
            }
            outfit.occasion = occasion;
        }

        if (outfitType !== undefined) {
            const outfitTypeDoc = await OutfitType.findById(outfitType);
            if (!outfitTypeDoc || !outfitTypeDoc.isActive) {
                return res.status(400).json({ success: false, message: "Invalid outfit type" });
            }
            outfit.outfitType = outfitType;
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

            try {
                const totalPrice = await validateItemsAndGetTotal(parsedItems);
                outfit.items = parsedItems;
                outfit.totalPrice = totalPrice;
            } catch (err) {
                return res.status(400).json({ success: false, message: err.message });
            }
        }

        if(req.file) {
            const oldPublicId = outfit.coverImage?.publicId;
            const {url, publicId} = await uploadImageToCloudinary(req.file.path, "ootdify/outfits");
            outfit.coverImage = {url, publicId};
            await deleteImageCloudinary(oldPublicId);
        }

        await outfit.save();

        return res.status(200).json({success: true, message: "Outfit Updated Successfully", outfit});
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Outfit not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the outfit",
            error: error.message,
        });
    }
}

export const setOutfitOfTheDay = async(req,res) => {
    try {
        
        const outfit = await Outfit.findById(req.params.id);

        if(!outfit || !outfit.isActive) {
            return res.status(404).json({success: false, message:"Outfit not found"});
        }

        await Outfit.updateMany(
            {gender: outfit.gender, isOOTD: true, _id: { $ne: outfit._id}},
            {isOOTD: false, ootdDate: null},
        );

        outfit.isOOTD = true;
        outfit.ootdDate = new Date();
        await outfit.save();

        return res.status(200).json({
            success: true,
            message: `Outfit of the Day set for ${outfit.gender}`,
            outfit,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Outfit not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while setting Outfit of the Day",
            error: error.message,
        });
    }
}

export const deleteOutfit = async(req,res) => {
    try {
        
        const outfit =  await Outfit.findById(req.params.id);

        if(!outfit || !outfit.isActive) {
            return res.status(404).json({success: false, message: "Outfit not found"});
        }

        outfit.isActive = false;
        outfit.isOOTD = false;
        await outfit.save();

        return res.status(200).json({
            success: true,
            message: "Outfit deleted successfully",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Outfit not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the outfit",
            error: error.message,
        });
    }
}
