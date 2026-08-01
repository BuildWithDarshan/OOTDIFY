import OutfitType from "../models/OutfitType.js";

export const createOutfitType = async(req, res) => {
    try {
        
        const {name, icon, isActive} = req.body;

        if(!name) {
            return res.status(400).json({success: false, message: "Outfit Type name is required"});
        }

        const existing = await OutfitType.findOne({name: name.trim()});
        if(existing) {
            return res.status(409).json({success: false, message: "An Outfit Type with this name already exist"});
        }

        const outfitType = await OutfitType.create({name: name.trim(), icon});

        return res.status(200).json({success: true, message: "Outfit Type created successfully", outfitType});

    } catch (error) {
        return res.status(500).json({success:false, message: "Something went wrong while creating an outfit type", error: error.message});
    }
}

export const getOutfitTypes = async(req, res) => {
    try {
        
        const outfitTypes = await OutfitType.find({isActive: true}).sort({name: 1});

        return res.status(200).json({success:true, count: outfitTypes.length , outfitTypes});

    } catch (error) {
        return res.status(500).json({success:false, message: "Something went wrong while fetching outfit types", error: error.message});
    }
}

export const getOutfitTypeById = async (req, res) => {
    try {
        const outfitType = await OutfitType.findById(req.params.id);
 
        if (!outfitType || !outfitType.isActive) {
            return res.status(404).json({
                success: false,
                message: "Outfit type not found",
            });
        }
 
        return res.status(200).json({
            success: true,
            outfitType,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Outfit type not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching the outfit type",
            error: error.message,
        });
    }
};

export const updateOutfitType = async(req, res) => {
    try {
        
        const {name, icon , isActive} = req.body;

        const outfitType = await OutfitType.findById(req.params.id);

        if(!outfitType) {
            return res.status(404).json({success: false, message: "Outfit Type not found"});
        }

        if(name && name.trim() !== outfitType.name) {
            const duplicate = await OutfitType.findOne({name: name.trim()});
            if(duplicate) {
                return res.status(409).json({success: false, message: "An outfit type with this name already exists"});
            }
            outfitType.name = name.trim();
            outfitType.slug = undefined; 
        }

        if(icon !== undefined) outfitType.icon = icon;
        if(isActive !== undefined) outfitType.isActive = isActive;

        await outfitType.save();

        return res.status(200).json({
            success: true,
            message: "Outfit type updated successfully",
            outfitType,
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Outfit type not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the outfit type",
            error: error.message,
        });
    }
}

export const deleteOutfitType = async(req, res) => {
    try {
        
        const outfitType = await OutfitType.findById(req.params.id);

        if(!outfitType) {
            return res.status(404).json({success: false, message: "Outfit Type not found"});
        }

        outfitType.isActive = false;
        await outfitType.save();

        return res.status(200).json({success: true, message: "Outfit type deleted successfully"});

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Outfit type not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the outfit type",
            error: error.message,
        });
    }
}