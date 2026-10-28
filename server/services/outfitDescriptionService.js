const ACCESSORY_WORDS = /\b(?:bags?|handbags?|glasses|sunglasses|chains?|jewelry|jewellery|watches|belts?)\b/i;
const LIST_WORDING = /\b(?:featuring|ensemble|paired with|complemented by)\b/i;

function colorPhrase(items) {
    const colors = [...new Set(items.flatMap((item) =>
        item.visualAnalysis?.colors?.map((color) => color.trim().toLowerCase()) ?? []
    ).filter(Boolean))].slice(0, 3);
    if (colors.length === 0) return "";
    if (colors.length === 1) return `${colors[0]} tones`;
    if (colors.length === 2) return `${colors[0]} and ${colors[1]} tones`;
    return `${colors[0]}, ${colors[1]}, and ${colors[2]} tones`;
}

function garmentPhrase(item) {
    const subtype = String(item.itemSubType ?? "garment").replaceAll("-", " ");
    const color = item.visualAnalysis?.colors?.[0]?.trim();
    return `${color ? `${color} ` : ""}${subtype}`;
}

export function getOutfitDescription(outfitDraft, items) {
    const suggested = typeof outfitDraft.description === "string"
        ? outfitDraft.description.trim().replace(/\s+/g, " ")
        : "";
    if (suggested.length >= 35 && suggested.length <= 350 &&
        !/^a coordinated outfit featuring\b/i.test(suggested) &&
        !LIST_WORDING.test(suggested) &&
        !ACCESSORY_WORDS.test(suggested)) {
        return suggested;
    }

    const style = String(outfitDraft.styleSummary ?? "")
        .trim().toLowerCase().replace(/\b(outfit|look)\b/g, "").replace(/\s+/g, " ").trim();
    const look = style ? `A ${style} look` : "This look";
    const top = items.find((item) => item.itemType === "top" || item.itemType === "outerwear");
    const bottom = items.find((item) => item.itemType === "bottom");
    const footwear = items.find((item) => item.itemType === "footwear");
    const palette = colorPhrase(items);
    if (top && bottom && palette) {
        const layered = items.filter((item) => item.itemType === "top" || item.itemType === "outerwear").length > 1 ||
            /\blayer(?:ed|ing)?\b/i.test(top.visualAnalysis?.visualDescription ?? "");
        const wideLeg = /wide-leg/i.test(bottom.itemSubType) ||
            /\bwide.leg\b/i.test(bottom.visualAnalysis?.visualDescription ?? "");
        const relaxed = /\b(loose|oversized|relaxed)\b/i.test(top.visualAnalysis?.fit ?? "");
        const silhouette = wideLeg ? "relaxed wide-leg silhouette" :
            relaxed ? "relaxed silhouette" : "clean silhouette";
        const opening = palette[0].toUpperCase() + palette.slice(1);
        const styleClause = style ? `this ${style} look` : "the outfit";
        const finish = footwear ? `, with ${garmentPhrase(footwear)} adding a clean finish` : "";
        return `${opening} ${layered ? "bring layered depth to" : "define"} a ${silhouette} in ${styleClause}${finish}.`;
    }
    const names = items.map(garmentPhrase);
    return names.length ? `${look} centers on ${names.join(" and ")}.` : `${look} highlights the visible clothing.`;
}
