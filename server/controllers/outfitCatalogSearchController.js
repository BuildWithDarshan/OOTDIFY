import Item from "../models/Item.js";
import { matchCatalogItem } from "../services/catalogMatchService.js";

const ITEM_TYPES = new Set(["top", "bottom", "footwear", "outerwear"]);
const GENDERS = new Set(["men", "women"]);
const MAX_GARMENTS = 12;
const MAX_RESULTS_PER_GARMENT = 12;
const MAX_SEARCH_QUERIES = 5;

function validateGarment(garment, index) {
    const label = `Garment ${index + 1}`;
    if (!garment || typeof garment !== "object" || Array.isArray(garment)) {
        return `${label} must be an object.`;
    }
    if (!ITEM_TYPES.has(garment.itemType)) return `${label} has an invalid itemType.`;
    if (typeof garment.itemSubType !== "string" ||
        !garment.itemSubType.trim() || garment.itemSubType.length > 80) {
        return `${label} must have an itemSubType of 1 to 80 characters.`;
    }
    if (garment.gender != null && !GENDERS.has(garment.gender)) {
        return `${label} has an invalid gender.`;
    }
    if (!Array.isArray(garment.colors) || garment.colors.length < 1 || garment.colors.length > 10 ||
        garment.colors.some((color) => typeof color !== "string" || !color.trim() || color.length > 40)) {
        return `${label} has invalid colors.`;
    }
    if (!Array.isArray(garment.searchQueries) ||
        garment.searchQueries.length > MAX_SEARCH_QUERIES ||
        garment.searchQueries.some((query) => typeof query !== "string" || query.length > 120)) {
        return `${label} has invalid searchQueries.`;
    }
    for (const field of ["name", "fit", "pattern", "visualDescription"]) {
        if (garment[field] != null &&
            (typeof garment[field] !== "string" || garment[field].length > 240)) {
            return `${label} has an invalid ${field}.`;
        }
    }
    return null;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const searchOutfitCatalog = async (req, res) => {
    const { garments } = req.body ?? {};
    if (!Array.isArray(garments) || garments.length < 1 || garments.length > MAX_GARMENTS) {
        return res.status(400).json({
            success: false,
            message: `Provide between 1 and ${MAX_GARMENTS} garments.`,
        });
    }
    for (let index = 0; index < garments.length; index += 1) {
        const error = validateGarment(garments[index], index);
        if (error) return res.status(400).json({ success: false, message: error });
    }

    try {
        const results = await Promise.all(garments.map(async (garment, garmentIndex) => {
            const filter = { isActive: true, itemType: garment.itemType };
            if (garment.gender) filter.gender = garment.gender;

            // A stored item has no color field. Its actual title must prove a color match.
            // This coarse query narrows candidates; matchCatalogItem checks the full color.
            const firstColor = garment.colors[0]?.toLowerCase().trim();
            if (firstColor) {
                const colorWord = firstColor.split(/[\s-]+/).at(-1);
                filter.name = {
                    $regex: colorWord === "grey" || colorWord === "gray"
                        ? "gr[ae]y" : escapeRegExp(colorWord),
                    $options: "i",
                };
            }

            const candidates = await Item.find(filter)
                .select("name image price referralLink shoppingSite brand gender itemType itemSubType isWardrobeEssential createdAt")
                .sort({ createdAt: -1 })
                .lean();
            const matches = candidates
                .map((item) => matchCatalogItem(item, garment))
                .filter(Boolean)
                .sort((a, b) => b.score - a.score ||
                    new Date(b.item.createdAt) - new Date(a.item.createdAt))
                .slice(0, MAX_RESULTS_PER_GARMENT)
                .map(({ item }) => item);

            return { garmentIndex, matches };
        }));
        return res.status(200).json({ success: true, results });
    } catch (error) {
        console.error("Failed to search the outfit item catalog:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while searching the item catalog.",
        });
    }
};
