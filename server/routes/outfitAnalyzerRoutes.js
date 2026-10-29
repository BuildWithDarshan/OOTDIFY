import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { normalizeClothingSuggestions, normalizeGarmentDiscoveryFields } from "../services/clothingSuggestions.js";
import { getOutfitDescription } from "../services/outfitDescriptionService.js";
import { requestOllamaAnalysis } from "../services/ollamaRequestService.js";

const router = express.Router();
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: 1,
    },
});

export const allowedSubtypesByType = {
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
        "wide-leg-jeans",
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

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNullableString(value) {
    return value === null || typeof value === "string";
}

export function isValidAnalysis(analysis) {
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
            item.searchQueries.length !== 1 ||
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

 Identify clearly visible clothing only: tops, bottoms, footwear, and distinct outerwear. Include each garment once. Never include bags, glasses, sunglasses, belts, watches, jewelry, hats, or other accessories in itemSuggestions. Do not describe the person, pose, face, background, setting, or photography.

Check the complete outfit, including the waist and legs, before returning the items. Do not omit clearly visible pants, trousers, jeans, shorts, skirts, or leggings. Do not invent garments that are not visible.

For each garment, return:
- name: a short garment name with its main visible color and distinctive garment details (for example, brown leather jacket or dark blue wide-leg jeans)
- brand: null unless clearly visible
- genderSuggestion: "men", "women", or null
- itemType: "top", "bottom", "footwear", or "outerwear"
- itemSubType: a specific subtype
- visualAnalysis: visible colors, one short visual description, fit, and pattern
- searchQueries: exactly one product search with the main visible color, specific garment, and "for men" or "for women" when the outfit gender is known

Allowed top subtypes: t-shirt, shirt, button-up-shirt, polo-shirt, tank-top, sweater, hoodie, sweatshirt, kurta, blouse, crop-top.
 Allowed bottom subtypes: jeans, trousers, pants, chinos, shorts, joggers, cargo-pants, wide-leg-jeans, skirt, leggings, wide-leg-trousers, wide-leg-pants.
Allowed footwear subtypes: sneakers, boots, loafers, sandals, formal-shoes, slides.
Allowed outerwear subtypes: jacket, blazer, coat, bomber-jacket, denim-jacket, cardigan, overshirt, open-shirt-layer, shirt, button-up-shirt.

 The subtype must be one of the exact values above. A long-sleeve T-shirt is still t-shirt; denim jeans are jeans or wide-leg-jeans; loafers are loafers. Put fit and sleeve details in visualAnalysis, not itemSubType. Ignore bags, chains, and jewelry when writing search queries.

 Write outfitDraft.description as one polished fashion sentence (roughly 18 to 35 words). Lead with the visible palette, silhouette, or style mood, then describe one or two distinctive clothing relationships. Make it specific to this image without enumerating every garment. Avoid the words "featuring", "ensemble", and "paired with". Do not mention accessories, brands, materials, or cultural influences unless clearly supported by the image.

Return this structure:
{
  "outfitDraft": {
    "styleSummary": "Short style-focused title",
    "description": "One natural sentence about the visible outfit and how its garments work together.",
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
      "searchQueries": ["brown leather jacket for women"]
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
                num_predict: 1600,
            },
        };

        let ollamaResponse;
        try {
            ollamaResponse = await requestOllamaAnalysis(ollamaPayload);
        } catch (error) {
            console.error("Local outfit analyzer Ollama request failed:", error);
            const timedOut = error.code === "OLLAMA_TIMEOUT";
            return res.status(timedOut ? 504 : 502).json({
                success: false,
                message: timedOut
                    ? "Ollama took longer than 10 minutes to analyze the image. Check that the model is still running and try again."
                    : "Could not complete the local Ollama request. Check that Ollama and the model are running.",
            });
        }

        const ollamaText = ollamaResponse.body;
        if (ollamaResponse.statusCode < 200 || ollamaResponse.statusCode >= 300) {
            console.error(
                `Ollama returned HTTP ${ollamaResponse.statusCode}:`,
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

         analysis = normalizeClothingSuggestions(analysis, allowedSubtypesByType);
         analysis = normalizeGarmentDiscoveryFields(analysis);
         if (isRecord(analysis) && Array.isArray(analysis.itemSuggestions) &&
             analysis.itemSuggestions.length === 0) {
             return res.status(422).json({
                 success: false,
                 message: "No supported clothing was identified. Try an image with visible garments.",
             });
         }

         if (!isValidAnalysis(analysis)) {
     const unsupportedSubtype = analysis?.itemSuggestions?.find((item) =>
         item && Object.hasOwn(allowedSubtypesByType, item.itemType) &&
         !allowedSubtypesByType[item.itemType].includes(item.itemSubType)
     );
     const message = unsupportedSubtype
         ? `Ollama used unsupported ${unsupportedSubtype.itemType} subtype "${String(unsupportedSubtype.itemSubType).slice(0, 80)}".`
         : "Ollama returned analysis with an invalid structure.";
     console.warn("Invalid Ollama outfit analysis:", message);
    return res.status(502).json({
        success: false,
         message,
    });
}

        const styleSummary = analysis.outfitDraft.styleSummary.trim();

        analysis.outfitDraft.title = styleSummary || "Clothing Look";
        analysis.outfitDraft.description = getOutfitDescription(
            analysis.outfitDraft,
            analysis.itemSuggestions
        );
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
