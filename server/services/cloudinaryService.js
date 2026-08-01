import fs from "fs";
import cloudinary from "../config/cloudinary.js";

export const uploadImageToCloudinary = async(localFilePath, folder = "ootdify") => {
    try {
        
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder, resource_type: "image"
        });
        return {
            url: result.secure_url,
            publicId: result.public_id,
        };

    } finally {
        fs.unlink(localFilePath, (err) => {
            if(err) console.error("Failed to delete temp upload file:", localFilePath, err.message);
        })
    }
}

export const deleteImageCloudinary = async(publicId) => {
    if(!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Failed to delete Image from cloudinary",publicId, error.message);
    }
}