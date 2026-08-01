import StyleTip from "../models/StyleTip.js";
import {uploadImageToCloudinary, deleteImageCloudinary} from "../services/cloudinaryService.js"

export const createStyleTip = async(req,res) => {
    try {

        const {title, content, category} = req.body;

        if(!title || !content) {
            return res.status(400).json({success: false, message: "title and content are required"});
        }

        if(!req.file) {
            return res.status(400).json({success: false, message: "Cover Image is required"});
        }

        const {url, publicId} = await uploadImageToCloudinary(req.file.path, "ootdify/style-tips");

        const styleTip = await StyleTip.create({
            title: title.trim(),
            coverImage: {url, publicId},
            content,
            category: category || "general",
        });

        return res.status(201).json({
            success: true,
            message: "Style tip created successfully",
            styleTip,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the style tip",
            error: error.message,
        });
    }
}

export const getStyleTips = async(req,res) => {
    try {
        
        const {category} = req.query;

        const filter = {isActive: true};
        if(category) filter.category = category;

        const styleTips = await StyleTip.find(filter).sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            count: styleTips.length,
            styleTips,
        }); 
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching style tips",
            error: error.message,
        });
    }
}

export const getStyleTipById = async(req,res) => {
    try {
        
        const styleTip = await StyleTip.findById(req.params.id);

        if(!styleTip || !styleTip.isActive) {
            return res.status(404).json({
                success: false,
                message: "Style tip not found",
            });
        }

        return res.status(200).json({success: true, styleTip});

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Style tip not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching the style tip",
            error: error.message,
        });
    }
}

export const updateStyleTip = async(req,res) => {
    try {
        
        const styleTip = await StyleTip.findById(req.params.id);

        if(!styleTip) {
            return res.status(404).json({
                success: false,
                message: "Style tip not found",
            });
        }

        const {title, content, category, isActive} = req.body;

        if(title !== undefined) {
            styleTip.title = title.trim();
            styleTip.slug = undefined;
        }
        if (content !== undefined) styleTip.content = content;
        if (category !== undefined) styleTip.category = category;
        if (isActive !== undefined) styleTip.isActive = isActive === "true";

        if(req.file) {
            const oldPublicId = styleTip.coverImage?.publicId;
            const {url, publicId} = await uploadImageToCloudinary(req.file.path, "ootdify/style-tips");
            styleTip.coverImage = {url, publicId};
            await deleteImageCloudinary(oldPublicId);
        }

        await styleTip.save();

        return res.status(200).json({
            success: true,
            message: "Style tip updated successfully",
            styleTip,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Style tip not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the style tip",
            error: error.message,
        });
    }
}

export const deleteStyleTip = async(req,res) => {
    try {
        
        const styleTip = await StyleTip.findById(req.params.id);

        if (!styleTip) {
            return res.status(404).json({
                success: false,
                message: "Style tip not found",
            });
        }

        styleTip.isActive = false;

        await styleTip.save();

        return res.status(200).json({
            success: true,
            message: "Style tip deleted successfully",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Style tip not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the style tip",
            error: error.message,
        });
    }
}