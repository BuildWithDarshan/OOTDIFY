const MAX_UPLOAD_IMAGE_SIZE = 4 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2400;

const loadImage = (src) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("The image could not be read."));
        image.src = src;
    });

const canvasToJpeg = (canvas, quality) =>
    new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) =>
                blob
                    ? resolve(blob)
                    : reject(new Error("The image could not be processed.")),
            "image/jpeg",
            quality,
        );
    });

const createJpegFile = async (canvas, fileName) => {
    let currentCanvas = canvas;

    for (let attempt = 0; attempt < 12; attempt += 1) {
        const quality = Math.max(0.45, 0.92 - attempt * 0.06);
        const blob = await canvasToJpeg(currentCanvas, quality);
        if (blob.size <= MAX_UPLOAD_IMAGE_SIZE) {
            const safeName = fileName.replace(/\.[^.]+$/, "");
            return new File([blob], `${safeName}.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now(),
            });
        }

        if (quality <= 0.45) {
            const smallerCanvas = document.createElement("canvas");
            smallerCanvas.width = Math.max(
                1,
                Math.round(currentCanvas.width * 0.8),
            );
            smallerCanvas.height = Math.max(
                1,
                Math.round(currentCanvas.height * 0.8),
            );
            smallerCanvas
                .getContext("2d")
                ?.drawImage(
                    currentCanvas,
                    0,
                    0,
                    smallerCanvas.width,
                    smallerCanvas.height,
                );
            currentCanvas = smallerCanvas;
        }
    }

    throw new Error("The optimized image is still too large to upload.");
};

export const createCroppedImageFile = async (imageUrl, cropPixels, fileName) => {
    const image = await loadImage(imageUrl);
    const scale = Math.min(
        1,
        MAX_IMAGE_DIMENSION / Math.max(cropPixels.width, cropPixels.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(cropPixels.width * scale));
    canvas.height = Math.max(1, Math.round(cropPixels.height * scale));
    const context = canvas.getContext("2d");

    if (!context || canvas.width <= 0 || canvas.height <= 0) {
        throw new Error("Select a valid crop area.");
    }

    context.drawImage(
        image,
        Math.round(cropPixels.x),
        Math.round(cropPixels.y),
        Math.round(cropPixels.width),
        Math.round(cropPixels.height),
        0,
        0,
        canvas.width,
        canvas.height,
    );

    return createJpegFile(canvas, fileName);
};

export const optimizeImageForUpload = async (file) => {
    const imageUrl = URL.createObjectURL(file);
    try {
        const image = await loadImage(imageUrl);
        const scale = Math.min(
            1,
            MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("The image could not be processed.");
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return await createJpegFile(canvas, file.name);
    } finally {
        URL.revokeObjectURL(imageUrl);
    }
};
