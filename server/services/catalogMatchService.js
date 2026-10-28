const COLOR_NAMES = [
    "off white", "light blue", "dark blue", "navy blue", "light grey",
    "dark grey", "light gray", "dark gray", "olive green", "forest green",
    "white", "black", "beige", "cream", "ivory", "tan", "camel",
    "brown", "maroon", "burgundy", "red", "pink", "orange", "yellow",
    "green", "olive", "blue", "navy", "purple", "grey", "gray", "khaki",
    "silver", "gold",
];

const COLOR_ALIASES = new Map([
    ["grey", "gray"], ["light grey", "light gray"],
    ["dark grey", "dark gray"], ["navy", "navy blue"],
]);

function words(value) {
    return String(value ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function hasPhrase(text, phrase) {
    return ` ${text} `.includes(` ${phrase} `);
}

function canonicalColor(color) {
    const normalized = words(color);
    return COLOR_ALIASES.get(normalized) ?? normalized;
}

function colorsIn(text) {
    let remaining = ` ${words(text)} `;
    const found = new Set();
    for (const name of COLOR_NAMES) {
        const phrase = words(name);
        if (hasPhrase(remaining.trim(), phrase)) {
            found.add(canonicalColor(name));
            remaining = remaining.replaceAll(` ${phrase} `, " ");
        }
    }
    return found;
}

function garmentFamily(text, itemType) {
    const value = words(text);
    const has = (phrase) => hasPhrase(value, phrase);

    if (itemType === "top" || itemType === "outerwear") {
        if (has("t shirt") || has("tee") || has("tees")) return "t-shirt";
        if (has("polo shirt") || has("polo")) return "polo-shirt";
        if (has("tank top")) return "tank-top";
        if (has("sweatshirt")) return "sweatshirt";
        if (has("hoodie")) return "hoodie";
        if (has("blouse")) return "blouse";
        if (has("kurta")) return "kurta";
        if (has("crop top")) return "crop-top";
        if (has("sweater")) return "sweater";
        if (has("overshirt") || has("open shirt layer")) return "overshirt";
        if (has("shirt")) return "shirt";
        if (has("bomber jacket")) return "bomber-jacket";
        if (has("denim jacket")) return "denim-jacket";
        if (has("jacket")) return "jacket";
        if (has("blazer")) return "blazer";
        if (has("cardigan")) return "cardigan";
        if (has("coat")) return "coat";
    }
    if (itemType === "bottom") {
        if (has("cargo pants") || has("cargo trousers") || has("cargos")) return "cargo-pants";
        if (has("jeans") || has("denim pants")) return "jeans";
        if (has("chinos")) return "chinos";
        if (has("joggers")) return "joggers";
        if (has("leggings")) return "leggings";
        if (has("shorts")) return "shorts";
        if (has("skirt")) return "skirt";
        if (has("trousers") || has("pants")) return "pants";
    }
    if (itemType === "footwear") {
        if (has("sneakers")) return "sneakers";
        if (has("boots")) return "boots";
        if (has("loafers")) return "loafers";
        if (has("sandals")) return "sandals";
        if (has("slides")) return "slides";
        if (has("formal shoes")) return "formal-shoes";
    }
    return null;
}

function requestedFamily(garment) {
    return garmentFamily(garment.itemSubType, garment.itemType);
}

function requiresWideLeg(garment) {
    return [garment.itemSubType, garment.fit, garment.name, garment.visualDescription]
        .some((value) => hasPhrase(words(value), "wide leg"));
}

function patternFamily(text) {
    const value = words(text);
    if (/\b(stripe|stripes|striped)\b/.test(value)) return "striped";
    if (/\b(check|checked|checkered|plaid)\b/.test(value)) return "checked";
    if (/\bfloral\b/.test(value)) return "floral";
    if (/\bgraphic\b/.test(value)) return "graphic";
    if (/\b(solid|plain)\b/.test(value)) return "solid";
    return null;
}

export function matchCatalogItem(item, garment) {
    if (item.itemType !== garment.itemType) return null;
    if (garment.gender && item.gender !== garment.gender) return null;

    const family = requestedFamily(garment);
    const titleFamily = garmentFamily(item.name, item.itemType);
    const subtypeFamily = garmentFamily(item.itemSubType, item.itemType);
    if (!family || (titleFamily || subtypeFamily) !== family) return null;
    // A specific stored subtype must not contradict the title or request.
    if (subtypeFamily && !["shirt", "pants"].includes(subtypeFamily) &&
        subtypeFamily !== family) return null;

    const wantedColors = (garment.colors ?? [])
        .map(canonicalColor)
        .filter(Boolean);
    const itemColors = colorsIn(item.name);
    const knownColors = new Set(COLOR_NAMES.map(canonicalColor));
    const title = words(item.name);
    if (wantedColors.some((color) => knownColors.has(color)
        ? !itemColors.has(color) : !hasPhrase(title, color))) return null;
    if ([...itemColors].some((color) => !wantedColors.includes(color))) return null;

    if (requiresWideLeg(garment) &&
        !hasPhrase(words(`${item.name} ${item.itemSubType}`), "wide leg")) {
        return null;
    }

    const wantedPattern = patternFamily(`${garment.pattern ?? ""} ${garment.visualDescription ?? ""}`);
    if (wantedPattern && patternFamily(item.name) !== wantedPattern) return null;

    const candidateText = words(`${item.name} ${item.itemSubType}`);
    const queryWords = new Set(
        (garment.searchQueries ?? [])
            .flatMap((query) => words(query).split(" "))
            .filter((word) => word.length > 2)
    );
    const queryHits = [...queryWords].filter((word) => hasPhrase(candidateText, word)).length;
    const exactSubtype = words(item.itemSubType) === words(garment.itemSubType);

    return {
        item,
        score: wantedColors.length * 10 + (exactSubtype ? 5 : 0) + Math.min(queryHits, 5),
    };
}
