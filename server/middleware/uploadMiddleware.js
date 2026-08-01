import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = process.env.VERCEL ? "/tmp/ootdify-uploads" : "uploads/";

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

// Vercel Functions accept payloads up to 4.5 MB, including multipart overhead.
const upload = multer({storage, fileFilter, limits: {fileSize: 4 * 1024 * 1024}});

export const uploadSingleImage = upload.single("image");

export const uploadOutfitImage = upload.single("coverImage");
