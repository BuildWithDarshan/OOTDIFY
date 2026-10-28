import test from "node:test";
import assert from "node:assert/strict";
import { matchCatalogItem } from "../services/catalogMatchService.js";
import { keepClothingSuggestions, normalizeClothingSuggestions } from "../services/clothingSuggestions.js";
import { isValidAnalysis } from "../routes/outfitAnalyzerRoutes.js";
import { buildRetailerSearchLinks } from "../services/retailerSearchLinkService.js";
import { getApprovedRetailerById, getApprovedRetailers } from "../config/approvedRetailers.js";
import { createRetailerSearchLinks } from "../controllers/retailerSearchLinksController.js";
import { searchOutfitCatalog } from "../controllers/outfitCatalogSearchController.js";
import Item from "../models/Item.js";

const shirt = {
    itemType: "top", itemSubType: "button-up-shirt", gender: "men",
    colors: ["white", "light blue"], name: "Button-up shirt",
    visualDescription: "White button-up shirt with light blue stripes",
    searchQueries: ["white button-up shirt", "white light blue shirt"],
};

function item(name, itemSubType, itemType = "top") {
    return {
        _id: name, name, itemSubType, itemType, gender: "men",
        brand: "Test brand", shoppingSite: "Test store", price: 999,
        referralLink: "https://example.com/product",
        image: { url: "https://example.com/product.jpg" },
        createdAt: new Date("2026-01-01"),
    };
}

test("a shirt does not match a white T-shirt or a maroon shirt", () => {
    assert.equal(matchCatalogItem(item("White cotton T-shirt", "t-shirt"), shirt), null);
    assert.equal(matchCatalogItem(item("White light blue striped shirt", "t-shirt"), shirt), null);
    assert.equal(matchCatalogItem(item("Maroon button-up shirt", "shirt"), shirt), null);
    assert.ok(matchCatalogItem(item("White light blue striped button-up shirt", "shirt"), shirt));
    assert.equal(matchCatalogItem(item("White light blue black striped shirt", "shirt"), shirt), null);
    assert.equal(matchCatalogItem(item("White light blue solid button-up shirt", "shirt"), shirt), null);
    assert.equal(matchCatalogItem(item("White button-up shirt", "shirt"), shirt), null);
});

test("an exact color outside the common palette can still match", () => {
    const garment = { ...shirt, colors: ["teal"], visualDescription: "Teal button-up shirt" };
    assert.ok(matchCatalogItem(item("Teal button-up shirt", "shirt"), garment));
    assert.equal(matchCatalogItem(item("Blue button-up shirt", "shirt"), garment), null);
});

test("beige wide leg jeans require the same color, garment family and fit", () => {
    const garment = {
        itemType: "bottom", itemSubType: "jeans", gender: "women",
        colors: ["beige"], name: "Beige wide-leg jeans",
        visualDescription: "Beige wide-leg jeans",
        searchQueries: ["beige wide leg jeans"],
    };
    const candidate = (name, subtype) => ({ ...item(name, subtype, "bottom"), gender: "women" });
    assert.ok(matchCatalogItem(candidate("Beige Wide Leg Jeans", "jeans"), garment));
    assert.equal(matchCatalogItem(candidate("Black Wide Leg Jeans", "jeans"), garment), null);
    assert.equal(matchCatalogItem(candidate("Beige Wide Leg Trousers", "trousers"), garment), null);
    assert.equal(matchCatalogItem(candidate("Beige Slim Jeans", "jeans"), garment), null);
});

test("a misleading query cannot make an unrelated item qualify", () => {
    const badQuery = { ...shirt, searchQueries: ["maroon t-shirt"] };
    assert.equal(matchCatalogItem(item("Maroon T-shirt", "t-shirt"), badQuery), null);
    assert.equal(matchCatalogItem(item("White T-shirt", "t-shirt"), badQuery), null);
});

test("accessory suggestions are removed without discarding clothing", () => {
    const analysis = { itemSuggestions: [
        { itemType: "top", itemSubType: "shirt", name: "White shirt" },
        { itemType: "accessory", itemSubType: "sunglasses", name: "Sunglasses" },
        { itemType: "top", itemSubType: "bag", name: "Black handbag" },
    ] };
    assert.deepEqual(keepClothingSuggestions(analysis).itemSuggestions, [analysis.itemSuggestions[0]]);
    assert.equal(keepClothingSuggestions({ itemSuggestions: [analysis.itemSuggestions[1]] }).itemSuggestions.length, 0);
});

test("the photographed outfit's Ollama subtype labels normalize to accepted clothing", () => {
    const base = {
        brand: null, genderSuggestion: "men",
        visualAnalysis: { colors: ["black"], visualDescription: "", fit: "Loose", pattern: "Solid" },
        searchQueries: ["first query", "second query"],
    };
    const analysis = {
        outfitDraft: {
            styleSummary: "Casual Streetwear", genderSuggestion: "men",
            occasionSuggestion: "Casual Outfit", outfitTypeSuggestion: "Casual Streetwear",
            seasonSuggestion: "all-season",
        },
        itemSuggestions: [
            { ...base, name: "T-shirt", itemType: "top", itemSubType: "long-sleeve",
                visualAnalysis: { ...base.visualAnalysis, colors: ["gray", "white"],
                    visualDescription: "A gray long-sleeve t-shirt with white cuffs." } },
            { ...base, name: "Jeans", itemType: "bottom", itemSubType: "denim",
                visualAnalysis: { ...base.visualAnalysis,
                    visualDescription: "Black wide-leg jeans with a chain detail." } },
            { ...base, name: "Loafers", itemType: "footwear", itemSubType: "formal-shoes",
                visualAnalysis: { ...base.visualAnalysis,
                    visualDescription: "Black loafers with a classic design." } },
            { ...base, name: "Bag", itemType: "accessory", itemSubType: "bag" },
        ],
    };
    const normalized = normalizeClothingSuggestions(analysis, {
        top: ["t-shirt"], bottom: ["jeans", "wide-leg-jeans"], footwear: ["loafers", "formal-shoes"],
    });
    assert.deepEqual(normalized.itemSuggestions.map((item) => item.itemSubType),
        ["t-shirt", "wide-leg-jeans", "loafers"]);
    assert.equal(isValidAnalysis(normalized), true);

    const singularLoafer = {
        ...analysis,
        itemSuggestions: [{ ...analysis.itemSuggestions[2], itemSubType: "loafer" }],
    };
    assert.equal(normalizeClothingSuggestions(singularLoafer, {
        footwear: ["loafers"],
    }).itemSuggestions[0].itemSubType, "loafers");
});

test("the source registry contains 17 approved sources and reports unavailable search links", () => {
    const sources = getApprovedRetailers();
    assert.equal(sources.length, 17);
    assert.equal(sources.filter((source) => source.sourceType === "marketplace").length, 5);
    for (const link of buildRetailerSearchLinks("white shirt").links) {
        const source = getApprovedRetailerById(link.sourceId);
        assert.ok(source.domains.includes(new URL(link.searchUrl).hostname));
    }
    const source = getApprovedRetailerById("myntra");
    const originalTemplate = source.searchUrlTemplate;
    try {
        source.searchUrlTemplate = null;
        const link = buildRetailerSearchLinks("white shirt", { sourceIds: ["myntra"] }).links[0];
        assert.equal(link.available, false);
        assert.equal(link.searchUrl, null);
        assert.equal(link.homepageUrl, "https://myntra.com");
    } finally {
        source.searchUrlTemplate = originalTemplate;
    }
});

test("bad retailer queries return a clear validation error", async () => {
    const response = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await createRetailerSearchLinks({ body: { queries: ["   "] } }, response);
    assert.equal(response.code, 400);
    assert.match(response.body.message, /non-empty/);
});

test("catalog search returns only real qualifying item details", async () => {
    const originalFind = Item.find;
    const candidates = [
        item("White cotton T-shirt", "t-shirt"),
        item("Maroon button-up shirt", "shirt"),
        item("White light blue striped button-up shirt", "shirt"),
    ];
    Item.find = (filter) => ({
        select() { return this; }, sort() { return this; }, limit() { return this; },
        async lean() {
            return candidates.filter((candidate) =>
                candidate.itemType === filter.itemType &&
                (!filter.gender || candidate.gender === filter.gender) &&
                (!filter.name || new RegExp(filter.name.$regex, "i").test(candidate.name))
            );
        },
    });
    const response = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    try {
        await searchOutfitCatalog({ body: { garments: [shirt] } }, response);
        assert.equal(response.code, 200);
        assert.deepEqual(response.body.results[0].matches.map((match) => match.name),
            ["White light blue striped button-up shirt"]);
        assert.equal(response.body.results[0].matches[0].referralLink,
            "https://example.com/product");
        await searchOutfitCatalog({ body: { garments: [{ ...shirt, colors: ["beige"] }] } }, response);
        assert.equal(response.code, 200);
        assert.deepEqual(response.body.results[0].matches, []);
    } finally {
        Item.find = originalFind;
    }
});

test("catalog search rejects missing color instead of returning broad matches", async () => {
    const response = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await searchOutfitCatalog({ body: { garments: [{ ...shirt, colors: [] }] } }, response);
    assert.equal(response.code, 400);
    assert.match(response.body.message, /invalid colors/);
});
