const CLOTHING_TYPES = new Set(["top", "bottom", "footwear", "outerwear"]);
const ACCESSORY_WORDS = /\b(?:bags?|handbags?|purses?|backpacks?|sunglass(?:es)?|glasses|spectacles|eyewear|belts?|watches|jewelry|jewellery|necklaces?|bracelets?|earrings?|hats?|caps?|scarves|scarf|wallets?)\b/i;

export function keepClothingSuggestions(analysis) {
    if (!analysis || !Array.isArray(analysis.itemSuggestions)) return analysis;
    return {
        ...analysis,
        itemSuggestions: analysis.itemSuggestions.filter((item) =>
            item && CLOTHING_TYPES.has(item.itemType) &&
            !ACCESSORY_WORDS.test(`${item.name ?? ""} ${item.itemSubType ?? ""}`)
        ),
    };
}

function normalizedWords(value) {
    return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function subtypeFromDescription(item) {
    const text = normalizedWords(
        `${item.name ?? ""} ${item.visualAnalysis?.visualDescription ?? ""}`
    );
    if (item.itemType === "top") {
        if (/\b(t shirt|tshirt|tee)\b/.test(text)) return "t-shirt";
        if (/\bpolo\b/.test(text)) return "polo-shirt";
        if (/\bhoodie\b/.test(text)) return "hoodie";
        if (/\bsweatshirt\b/.test(text)) return "sweatshirt";
        if (/\bsweater\b/.test(text)) return "sweater";
        if (/\b(button up shirt|button down shirt)\b/.test(text)) return "button-up-shirt";
        if (/\bshirt\b/.test(text)) return "shirt";
    }
    if (item.itemType === "bottom") {
        if (/\bjeans?\b/.test(text)) {
            return /\bwide leg\b/.test(text) ? "wide-leg-jeans" : "jeans";
        }
        if (/\bcargo (pants|trousers)\b/.test(text)) return "cargo-pants";
        if (/\btrousers\b/.test(text)) return "trousers";
        if (/\bpants\b/.test(text)) return "pants";
        if (/\bshorts\b/.test(text)) return "shorts";
        if (/\bskirt\b/.test(text)) return "skirt";
    }
    if (item.itemType === "footwear") {
        if (/\bloafers?\b/.test(text)) return "loafers";
        if (/\bsneakers?\b/.test(text)) return "sneakers";
        if (/\bboots?\b/.test(text)) return "boots";
        if (/\bsandals?\b/.test(text)) return "sandals";
        if (/\bslides?\b/.test(text)) return "slides";
    }
    return null;
}

export function normalizeClothingSuggestions(analysis, allowedSubtypesByType) {
    const clothing = keepClothingSuggestions(analysis);
    if (!clothing || !Array.isArray(clothing.itemSuggestions)) return clothing;
    return {
        ...clothing,
        itemSuggestions: clothing.itemSuggestions.map((item) => {
            const subtype = String(item.itemSubType ?? "")
                .trim().toLowerCase().replace(/[\s_]+/g, "-");
            const inferred = subtypeFromDescription(item);
            const allowed = allowedSubtypesByType[item.itemType] ?? [];
            const shouldRefine = ["shirt", "pants", "jeans", "formal-shoes"].includes(subtype);
            const resolved = inferred && allowed.includes(inferred) &&
                (!allowed.includes(subtype) || shouldRefine)
                ? inferred : subtype;
            return { ...item, itemSubType: resolved };
        }),
    };
}

const COLOR_PREFIXES = [
    "off white", "light blue", "dark blue", "navy blue", "light grey",
    "dark grey", "light gray", "dark gray", "olive green", "forest green",
    "white", "black", "beige", "cream", "ivory", "tan", "camel",
    "brown", "maroon", "burgundy", "red", "pink", "orange", "yellow",
    "green", "olive", "blue", "navy", "purple", "grey", "gray", "khaki",
    "silver", "gold",
];

function titleCase(value) {
    return value.toLowerCase().replace(/(^|[\s-])([a-z])/g,
        (_, separator, letter) => separator + letter.toUpperCase());
}

function garmentCoreName(item, primaryColor) {
    let name = String(item.name ?? "").trim() ||
        String(item.itemSubType ?? "garment").replaceAll("-", " ");
    name = name
        .replace(/^(?:men's|women's|men|women)\s+/i, "")
        .replace(/\s+(?:for\s+)?(?:men|women)$/i, "")
        .trim();

    const prefixes = [primaryColor, ...COLOR_PREFIXES]
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);
    for (const color of prefixes) {
        if (name.toLowerCase().startsWith(`${color.toLowerCase()} `) ||
            name.toLowerCase().startsWith(`${color.toLowerCase()}-`)) {
            name = name.slice(color.length).replace(/^[\s\-&,]+/, "").trim();
            break;
        }
    }
    const subtype = String(item.itemSubType ?? "").toLowerCase();
    const specificSubtype = {
        "wide-leg-jeans": /^jeans?$/i,
        "wide-leg-pants": /^pants?$/i,
        "wide-leg-trousers": /^trousers?$/i,
        "button-up-shirt": /^shirts?$/i,
        "cargo-pants": /^pants?$/i,
    };
    if (specificSubtype[subtype]?.test(name)) {
        name = subtype.replace(/-(?=[^-]+$)/, " ");
    }
    return name || String(item.itemSubType ?? "garment").replaceAll("-", " ");
}

/** Give every analyzed garment one specific, editable default query. */
export function normalizeGarmentDiscoveryFields(analysis) {
    if (!analysis || !Array.isArray(analysis.itemSuggestions)) return analysis;
    const outfitGender = analysis.outfitDraft?.genderSuggestion;
    return {
        ...analysis,
        itemSuggestions: analysis.itemSuggestions.map((item) => {
            if (!item || typeof item !== "object") return item;
            const primaryColor = Array.isArray(item.visualAnalysis?.colors)
                ? String(item.visualAnalysis.colors[0] ?? "").trim() : "";
            const gender = ["men", "women"].includes(outfitGender)
                ? outfitGender : (["men", "women"].includes(item.genderSuggestion)
                    ? item.genderSuggestion : null);
            const core = garmentCoreName(item, primaryColor);
            const coloredName = `${primaryColor ? `${primaryColor} ` : ""}${core}`.trim();
            const name = `${titleCase(coloredName)}${gender ? ` ${titleCase(gender)}` : ""}`;
            const query = `${coloredName.replaceAll("-", " ").toLowerCase()}` +
                (gender ? ` for ${gender}` : "");

            return {
                ...item,
                name,
                genderSuggestion: gender,
                searchQueries: [query],
            };
        }),
    };
}
