const GENERIC_WORDS = new Set([
    "a", "an", "the", "casual", "yet", "stylish", "style", "outfit",
    "look", "fit", "inspo", "fashionable", "trendy", "modern", "simple",
    "chic", "comfortable", "everyday", "nice",
]);
const ACCESSORY_WORDS = /\b(?:bag|handbag|sunglasses|glasses|belt|watch|jewelry|jewellery)\b/i;

function titleCase(value) {
    return value.toLowerCase().replace(/(^|[\s-])([a-z])/g,
        (_, separator, letter) => separator + letter.toUpperCase());
}

function usableModelTitle(value, items) {
    if (typeof value !== "string") return "";
    const title = value.trim().replace(/^["'“”]+|["'“”]+$/g, "")
        .replace(/[.!?]+$/, "").replace(/\s+/g, " ");
    const words = title.split(/\s+/);
    const visibleColors = items.flatMap((item) => item.visualAnalysis?.colors ?? [])
        .map((color) => String(color).trim().toLowerCase()).filter(Boolean);
    const grounded = visibleColors.some((color) => title.toLowerCase().includes(color)) ||
        /\b(?:denim|leather|linen|layered|monochrome|wide[ -]leg)\b/i.test(title);
    if (title.length < 8 || title.length > 50 || words.length < 2 || words.length > 5 ||
        ACCESSORY_WORDS.test(title) ||
        /\bcasual yet stylish\b/i.test(title) ||
        /\b(?:featuring|paired with|wearing)\b/i.test(title) ||
        words.every((word) => GENERIC_WORDS.has(word.toLowerCase())) ||
        (/\b(?:outfit|look|style|inspo)$/i.test(title) && !grounded)) {
        return "";
    }
    return titleCase(title);
}

function garmentText(items) {
    return items.map((item) =>
        `${item.name ?? ""} ${item.itemSubType ?? ""} ${item.visualAnalysis?.visualDescription ?? ""}`
    ).join(" ").toLowerCase();
}

function primaryColor(items) {
    const primary = items.find((item) => item.itemType === "outerwear") ||
        items.find((item) => item.itemType === "top") ||
        items.find((item) => item.itemType === "bottom") || items[0];
    return String(primary?.visualAnalysis?.colors?.[0] ?? "").trim();
}

/** Prefer the model's editorial title; use visible garments for a stable fallback. */
export function getOutfitTitle(outfitDraft, items) {
    const clothing = Array.isArray(items) ? items : [];
    const proposed = usableModelTitle(outfitDraft.title, clothing);
    if (proposed) return proposed;

    const text = garmentText(clothing);
    const style = String(outfitDraft.styleSummary ?? "").toLowerCase();
    const color = primaryColor(clothing);
    const layers = clothing.filter((item) =>
        item.itemType === "top" || item.itemType === "outerwear").length > 1;
    const detail = /\bleather\b/.test(text) ? "Leather" :
        /\blinen\b/.test(text) ? "Linen" :
            layers ? "Layered" :
                /\b(?:denim|jeans)\b/.test(text) ? "Denim" :
                    /\bstreetwear\b/.test(style) ? "Streetwear" :
                        /\bwide[ -]leg\b/.test(text) ? "Wide-Leg" :
                            "Contrast";
    const ending = detail === "Leather" || detail === "Streetwear" ? "Edge" : "Edit";
    return titleCase(`${color || "Clothing"} ${detail} ${ending}`);
}
