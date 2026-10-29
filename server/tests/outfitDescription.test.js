import test from "node:test";
import assert from "node:assert/strict";
import { getOutfitDescription } from "../services/outfitDescriptionService.js";

const items = [
    { itemType: "top", itemSubType: "t-shirt", visualAnalysis: { colors: ["gray"] } },
    { itemType: "bottom", itemSubType: "wide-leg-jeans", visualAnalysis: { colors: ["black"] } },
    { itemType: "footwear", itemSubType: "loafers", visualAnalysis: { colors: ["black"] } },
];

test("keeps an image-specific description from Ollama", () => {
    const description = "An oversized gray tee and wide-leg black jeans create a relaxed streetwear silhouette, finished by black loafers.";
    assert.equal(getOutfitDescription({ styleSummary: "Streetwear", description }, items), description);
});

test("replaces the old garment-list template with a clothing-specific fallback", () => {
    const description = getOutfitDescription({
        styleSummary: "Casual Streetwear Outfit",
        description: "A coordinated outfit featuring Gray T-Shirt, Black Jeans, Black Loafers.",
    }, items);
    assert.match(description, /Gray and black tones/);
    assert.match(description, /wide-leg silhouette/);
    assert.doesNotMatch(description, /A coordinated outfit featuring/);
});

test("replaces a model-generated garment list with palette and silhouette copy", () => {
    const description = getOutfitDescription({
        styleSummary: "Casual Streetwear",
        description: "A casual streetwear ensemble featuring a layered top and wide-leg jeans, complemented by black loafers.",
    }, [
        { ...items[0], visualAnalysis: { colors: ["gray", "white"], visualDescription: "Layered gray top", fit: "Loose" } },
        ...items.slice(1),
    ]);
    assert.match(description, /Gray, white, and black tones/);
    assert.match(description, /layered depth/);
    assert.doesNotMatch(description, /featuring|ensemble|paired with|complemented by/i);
});

test("an accessory in the proposed description is not carried into the draft", () => {
    const description = getOutfitDescription({
        styleSummary: "Streetwear",
        description: "A relaxed outfit with black jeans and a large bag for everyday errands.",
    }, items);
    assert.doesNotMatch(description, /\bbag\b/i);
});
