import test from "node:test";
import assert from "node:assert/strict";
import { getOutfitTitle } from "../services/outfitTitleService.js";

const layeredItems = [
    { name: "Beige Jacket Men", itemType: "outerwear", itemSubType: "jacket",
        visualAnalysis: { colors: ["beige"], visualDescription: "A beige jacket." } },
    { name: "White T-Shirt Men", itemType: "top", itemSubType: "t-shirt",
        visualAnalysis: { colors: ["white"], visualDescription: "A white tee." } },
    { name: "Dark Blue Jeans Men", itemType: "bottom", itemSubType: "jeans",
        visualAnalysis: { colors: ["dark blue"], visualDescription: "Dark blue jeans." } },
];

test("keeps a short editorial title generated for the image", () => {
    assert.equal(getOutfitTitle({ title: "Urban Indigo Edge", styleSummary: "Casual streetwear" },
        layeredItems), "Urban Indigo Edge");
});

test("replaces generic model wording with a garment-specific title", () => {
    assert.equal(getOutfitTitle({ title: "Casual Yet Stylish", styleSummary: "Casual" },
        layeredItems), "Beige Layered Edit");
    assert.equal(getOutfitTitle({ title: "Casual Streetwear Outfit" },
        layeredItems), "Beige Layered Edit");
    assert.equal(getOutfitTitle({ title: "Casual Yet Stylish Vibes" },
        layeredItems), "Beige Layered Edit");
});

test("accepts a short title anchored to a visible color", () => {
    const maroon = [{ name: "Maroon Shirt Men", itemType: "top",
        itemSubType: "shirt", visualAnalysis: { colors: ["maroon"] } }];
    assert.equal(getOutfitTitle({ title: "Maroon Casual Look" }, maroon),
        "Maroon Casual Look");
});

test("uses a visible clothing detail when the model omits the title", () => {
    const items = [{ name: "Black Leather Jacket Women", itemType: "outerwear",
        itemSubType: "jacket", visualAnalysis: { colors: ["black"] } }];
    assert.equal(getOutfitTitle({ styleSummary: "Streetwear" }, items),
        "Black Leather Edge");
});

test("does not carry an accessory into the outfit title", () => {
    assert.equal(getOutfitTitle({ title: "Black Bag Edit" }, layeredItems),
        "Beige Layered Edit");
});
