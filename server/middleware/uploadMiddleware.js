import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";

if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true});
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg","image/jpg","image/png","image/webp"];

    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }else {
        cb(new Error("Only JPG, PNG, JPEG and WEBP image files are allowed"),false);
    }
}

const upload = multer({storage, fileFilter, limits: {fileSize: 5 * 1024 * 1024}});

export const uploadSingleImage = upload.single("image");

export const uploadOutfitImage = upload.single("coverImage");