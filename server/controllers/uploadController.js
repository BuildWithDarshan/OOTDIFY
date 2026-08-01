import { uploadImageToCloudinary } from "../services/cloudinaryService.js";

export const testUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file received — check the form-data key matches the middleware's field name ('image')",
            });
        }

        const { url, publicId } = await uploadImageToCloudinary(req.file.path);

        return res.status(200).json({
            success: true,
            message: "Upload successful",
            url,
            publicId,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Upload failed",
            error: error.message,
        });
    }
};
