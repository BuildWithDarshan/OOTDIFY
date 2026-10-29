import test from "node:test";
import assert from "node:assert/strict";
import { matchCatalogItem } from "../services/catalogMatchService.js";

const garment = {
    itemType: "outerwear",
    itemSubType: "jacket",
    gender: "women",
    colors: ["brown"],
    name: "Brown jacket",
    fit: "oversized",
    visualDescription: "A brown leather jacket with an oversized silhouette.",
    searchQueries: ["brown jacket for women"],
};

const candidate = (name) => ({
    name, itemType: "outerwear", itemSubType: "jacket", gender: "women",
});

test("fit and visible details rank otherwise eligible catalog jackets", () => {
    const exact = matchCatalogItem(candidate("Brown oversized leather jacket"), garment);
    const lessSpecific = matchCatalogItem(candidate("Brown regular jacket"), garment);
    assert.ok(exact);
    assert.ok(lessSpecific);
    assert.ok(exact.score > lessSpecific.score);
});

test("ranking never admits the wrong color or garment category", () => {
    assert.equal(matchCatalogItem(candidate("Black oversized leather jacket"), garment), null);
    assert.equal(matchCatalogItem({ ...candidate("Brown oversized leather jacket"),
        itemType: "top" }, garment), null);
});
