import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a well-known public test image, no local file needed —
// removes multer/file-path from the equation entirely
cloudinary.uploader.upload(
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    { folder: "ootdify-test" },
    (error, result) => {
        if (error) {
            console.error("UPLOAD FAILED:", error);
        } else {
            console.log("UPLOAD SUCCESS:", result.secure_url);
        }
    }
);