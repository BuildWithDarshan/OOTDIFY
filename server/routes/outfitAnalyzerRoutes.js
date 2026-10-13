import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: 1,
    },
});

const allowedSubtypesByType = {
    top: [
        "t-shirt",
        "shirt",
        "button-up-shirt",
        "polo-shirt",
        "tank-top",
        "sweater",
        "hoodie",
        "sweatshirt",
        "kurta",
        "blouse",
        "crop-top",
    ],
    bottom: [
        "jeans",
        "trousers",
        "pants",
        "chinos",
        "shorts",
        "joggers",
        "cargo-pants",
        "skirt",
        "leggings",
        "wide-leg-trousers",
        "wide-leg-pants",
    ],
    footwear: [
        "sneakers",
        "boots",
        "loafers",
        "sandals",
        "formal-shoes",
        "slides",
    ],
    outerwear: [
        "jacket",
        "blazer",
        "coat",
        "bomber-jacket",
        "denim-jacket",
        "cardigan",
        "overshirt",
        "open-shirt-layer",
        "shirt",
        "button-up-shirt",
    ],
};

const subtypeLabels = {
    "t-shirt": "T-Shirt",
    shirt: "Shirt",
    "button-up-shirt": "Button-Up Shirt",
    "polo-shirt": "Polo Shirt",
    "tank-top": "Tank Top",
    sweater: "Sweater",
    hoodie: "Hoodie",
    sweatshirt: "Sweatshirt",
    kurta: "Kurta",
    blouse: "Blouse",
    "crop-top": "Crop Top",
    jeans: "Jeans",
    trousers: "Trousers",
    pants: "Pants",
    chinos: "Chinos",
    shorts: "Shorts",
    joggers: "Joggers",
    "cargo-pants": "Cargo Pants",
    skirt: "Skirt",
    leggings: "Leggings",
    "wide-leg-trousers": "Wide-Leg Trousers",
    "wide-leg-pants": "Wide-Leg Pants",
    sneakers: "Sneakers",
    boots: "Boots",
    loafers: "Loafers",
    sandals: "Sandals",
    "formal-shoes": "Formal Shoes",
    slides: "Slides",
    jacket: "Jacket",
    blazer: "Blazer",
    coat: "Coat",
    "bomber-jacket": "Bomber Jacket",
    "denim-jacket": "Denim Jacket",
    cardigan: "Cardigan",
    overshirt: "Overshirt",
    "open-shirt-layer": "Overshirt",
};

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNullableString(value) {
    return value === null || typeof value === "string";
}

function isValidAnalysis(analysis) {
    if (!isRecord(analysis) || !isRecord(analysis.outfitDraft)) {
        return false;
    }

    const { outfitDraft, itemSuggestions } = analysis;

    if (
        typeof outfitDraft.styleSummary !== "string" ||
        !["men", "women", null].includes(outfitDraft.genderSuggestion) ||
        !isNullableString(outfitDraft.occasionSuggestion) ||
        !isNullableString(outfitDraft.outfitTypeSuggestion) ||
        !["summer", "winter", "monsoon", "all-season", null].includes(
            outfitDraft.seasonSuggestion
        ) ||
        !Array.isArray(itemSuggestions) ||
        itemSuggestions.length === 0 ||
        itemSuggestions.length > 12
    ) {
        return false;
    }

    return itemSuggestions.every((item) => {
        if (
            !isRecord(item) ||
            typeof item.name !== "string" ||
            !isNullableString(item.brand) ||
            !["men", "women", null].includes(item.genderSuggestion) ||
            !Object.hasOwn(allowedSubtypesByType, item.itemType) ||
            !allowedSubtypesByType[item.itemType].includes(item.itemSubType) ||
            !isRecord(item.visualAnalysis) ||
            !Array.isArray(item.visualAnalysis.colors) ||
            !item.visualAnalysis.colors.every(
                (color) => typeof color === "string"
            ) ||
            typeof item.visualAnalysis.visualDescription !== "string" ||
            !isNullableString(item.visualAnalysis.fit) ||
            !isNullableString(item.visualAnalysis.pattern) ||
            !Array.isArray(item.searchQueries) ||
            item.searchQueries.length !== 2 ||
            !item.searchQueries.every((query) => typeof query === "string")
        ) {
            return false;
        }

        return true;
    });
}

function getImageMimeType(buffer) {
    if (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
    ) {
        return "image/jpeg";
    }

    if (
        buffer.length >= 8 &&
        buffer.subarray(0, 8).equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        )
    ) {
        return "image/png";
    }

    if (
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
        return "image/webp";
    }

    return null;
}

function requireLocalAnalyzer(req, res, next) {
    const enabled = process.env.OUTFIT_ANALYZER_ENABLED === "true";
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!enabled || !isDevelopment) {
        return res.status(404).json({
            success: false,
            message: "Route not found",
        });
    }

    next();
}

router.post(
    "/",
    requireLocalAnalyzer,
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Upload an image using the 'image' field.",
            });
        }

        const detectedMimeType = getImageMimeType(req.file.buffer);
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

        if (
            !detectedMimeType ||
            !allowedMimeTypes.includes(req.file.mimetype) ||
            detectedMimeType !== req.file.mimetype
        ) {
            return res.status(400).json({
                success: false,
                message: "Only valid JPEG, PNG, and WEBP images are supported.",
            });
        }

        const prompt = `
Analyze the supplied outfit image for OOTDIFY. Return JSON only.

Identify clearly visible clothing only: tops, bottoms, footwear, and distinct outerwear. Include each garment once. Ignore accessories. Do not describe the person, pose, face, background, setting, or photography.

Check the complete outfit, including the waist and legs, before returning the items. Do not omit clearly visible pants, trousers, jeans, shorts, skirts, or leggings. Do not invent garments that are not visible.

For each garment, return:
- name: a short garment name
- brand: null unless clearly visible
- genderSuggestion: "men", "women", or null
- itemType: "top", "bottom", "footwear", or "outerwear"
- itemSubType: a specific subtype
- visualAnalysis: visible colors, one short visual description, fit, and pattern
- searchQueries: exactly two distinct product searches based on visible details

Allowed top subtypes: t-shirt, shirt, button-up-shirt, polo-shirt, tank-top, sweater, hoodie, sweatshirt, kurta, blouse, crop-top.
Allowed bottom subtypes: jeans, trousers, pants, chinos, shorts, joggers, cargo-pants, skirt, leggings, wide-leg-trousers, wide-leg-pants.
Allowed footwear subtypes: sneakers, boots, loafers, sandals, formal-shoes, slides.
Allowed outerwear subtypes: jacket, blazer, coat, bomber-jacket, denim-jacket, cardigan, overshirt, open-shirt-layer, shirt, button-up-shirt.

Return this structure:
{
  "outfitDraft": {
    "styleSummary": "Short style-focused title",
    "genderSuggestion": "men, women, or null",
    "occasionSuggestion": "Short suggestion or null",
    "outfitTypeSuggestion": "Short suggestion or null",
    "seasonSuggestion": "summer, winter, monsoon, all-season, or null"
  },
  "itemSuggestions": [
    {
      "name": "Garment name",
      "brand": null,
      "genderSuggestion": "men, women, or null",
      "itemType": "top, bottom, footwear, or outerwear",
      "itemSubType": "Allowed subtype",
      "visualAnalysis": {
        "colors": ["visible color"],
        "visualDescription": "One concise sentence about visible garment details.",
        "fit": null,
        "pattern": null
      },
      "searchQueries": ["first useful search", "second useful search"]
    }
  ]
}

Do not guess brands, materials, or hidden details. Use null for unknown fit or pattern. Occasion and outfit type are suggestions, not database IDs. Be concise.
`;

        const ollamaPayload = {
            model: "qwen2.5vl:3b",
            prompt,
            images: [req.file.buffer.toString("base64")],
            stream: false,
            keep_alive: "10m",
            format: "json",
            options: {
                temperature: 0.1,
                num_ctx: 8192,
                num_predict: 1000,
            },
        };

        let ollamaResponse;

        try {
            ollamaResponse = await fetch(
                "http://127.0.0.1:11434/api/generate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(ollamaPayload),
                    signal: AbortSignal.timeout(600_000),
                }
            );
        } catch (error) {
            console.error("Local outfit analyzer could not reach Ollama:", error);

            const timedOut = error.name === "TimeoutError";
            return res.status(timedOut ? 504 : 502).json({
                success: false,
                message: timedOut
                    ? "Ollama analysis timed out."
                    : "Could not connect to local Ollama. Check that Ollama is running and the model is installed.",
            });
        }

        let ollamaText;

        try {
            ollamaText = await ollamaResponse.text();
        } catch (error) {
            console.error("Could not read Ollama response:", error);
            return res.status(502).json({
                success: false,
                message: "Could not read the response from Ollama.",
            });
        }

        if (!ollamaResponse.ok) {
            console.error(
                `Ollama returned HTTP ${ollamaResponse.status}:`,
                ollamaText
            );
            return res.status(502).json({
                success: false,
                message: "Ollama returned an error while analyzing the image.",
            });
        }

        let ollamaResult;

        try {
            ollamaResult = JSON.parse(ollamaText);
        } catch (error) {
            console.error("Ollama returned invalid response JSON:", error);
            return res.status(502).json({
                success: false,
                message: "Ollama returned an invalid response.",
            });
        }

        if (ollamaResult.done_reason === "length") {
            return res.status(502).json({
                success: false,
                message: "Ollama reached its output limit; the analysis was incomplete.",
            });
        }

        if (typeof ollamaResult.response !== "string") {
            return res.status(502).json({
                success: false,
                message: "Ollama returned an empty analysis.",
            });
        }

        let analysis;

        try {
            analysis = JSON.parse(ollamaResult.response);
        } catch (error) {
            console.error("Ollama returned invalid analysis JSON:", error);
            return res.status(502).json({
                success: false,
                message: "Ollama returned malformed analysis JSON.",
            });
        }

        if (
    isRecord(analysis) &&
    isRecord(analysis.outfitDraft) &&
    typeof analysis.outfitDraft.seasonSuggestion === "string"
) {
    analysis.outfitDraft.seasonSuggestion =
        analysis.outfitDraft.seasonSuggestion.trim().toLowerCase();
}

        if (!isValidAnalysis(analysis)) {
    return res.status(502).json({
        success: false,
        message: "Ollama returned analysis with an invalid structure.",
    });
}

        const itemNames = analysis.itemSuggestions.map((item) => {
            const subtypeLabel = subtypeLabels[item.itemSubType];
            const color = item.visualAnalysis.colors[0]?.trim();

            return color
                ? `${color} ${subtypeLabel}`.replace(
                    /^\w/,
                    (firstLetter) => firstLetter.toUpperCase()
                )
                : subtypeLabel;
        });

        const styleSummary = analysis.outfitDraft.styleSummary.trim();
        const description = `A coordinated outfit featuring ${itemNames.join(", ")}.`;

        analysis.outfitDraft.title = styleSummary || "Clothing Look";
        analysis.outfitDraft.description = description;
        analysis.outfitDraft.isTrending = false;
        analysis.outfitDraft.isCelebrityInspired = false;
        analysis.outfitDraft.inspiredByLabel = null;

        analysis.itemSuggestions = analysis.itemSuggestions.map((item) => ({
            ...item,
            isWardrobeEssential: false,
            missingRequiredItemFields: [
                "image",
                "price",
                "referralLink",
                "shoppingSite",
            ],
        }));

        analysis.missingRequiredItemFields = [
            "image",
            "price",
            "referralLink",
            "shoppingSite",
        ];
        analysis.missingRequiredOutfitFields = [
            "coverImage",
            "occasion",
            "outfitType",
            "items",
            "totalPrice",
        ];

        return res.json({
            success: true,
            data: analysis,
        });
    }
);

export default router;