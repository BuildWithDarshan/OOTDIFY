import Occasion from "../models/Occasion.js"

export const createOccasion = async(req,res) => {
    try {
        const {name, icon} = req.body;
 
        if(!name) {
            return res.status(400).json({success:false, message: "Occasion Name is required"});
        }

        const existing = await Occasion.findOne({name: name.trim()});

        if(existing) {
            return res.status(409).json({success: false, message: "An occasion with this name already exist"});
        }

        const occasion = await Occasion.create({name: name.trim(), icon});

        return res.status(200).json({success: true, message: "Occasion created successfully", occasion});

    } catch (error) {
        return res.status(500).json({success:false, message: "Something went wrong while creating an occasion", error: error.message});
    }
}

export const getOccasions = async(req,res) => {
    try {
        const occasions = await Occasion.find({isActive: true}).sort({name: 1});

        return res.status(200).json({success: true, count: occasions.length, occasions});

    } catch (error) {
        return res.status(500).json({success:false, message: "Something went wrong while fetching occasions", error: error.message});
    }
}

export const getOccasionById = async(req,res) => {
    try {
        const occasion = await Occasion.findById(req.params.id);

        if(!occasion || !occasion.isActive) {
            return res.status(404).json({success:false, message: "Occasion not found"});
        }

        return res.status(200).json({success: true, occasion});

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Occasion not found",
          });
          }
          return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching the occasion",
            error: error.message,
          });
    }
}

export const updateOccasion = async(req,res) => {
    try {
        
        const {name, icon , isActive} = req.body;

        const occasion = await Occasion.findById(req.params.id);

        if(!occasion) {
            return res.status(404).json({
                success: false,
                message: "Occasion not found",
            });
        }

        if(name && name.trim() !== occasion.name){
            const duplicate = await Occasion.findOne({name: name.trim()});
            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: "An occasion with this name already exists",
                });
            }
            occasion.name = name.trim();
            occasion.slug = undefined;
        }

        if(icon !== undefined) occasion.icon = icon;
        if(isActive !== undefined) occasion.isActive = isActive;

        await occasion.save();

        return res.status(200).json({
            success: true,
            message: "Occasion updated successfully",
            occasion,
        });

     } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Occasion not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the occasion",
            error: error.message,
        });
    }
}

export const deleteOccasion = async(req,res) => {
    try {
        const occasion = await Occasion.findById(req.params.id);

        if(!occasion) {
            return res.status(404).json({
                success: false,
                message: "Occasion not found",
            });
        }

        occasion.isActive = false;

        await occasion.save();

        return res.status(200).json({
            success: true,
            message: "Occasion deleted successfully",
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Occasion not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the occasion",
            error: error.message,
        });
    }
}