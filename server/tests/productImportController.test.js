import test from "node:test";
import assert from "node:assert/strict";
import Item from "../models/Item.js";
import { previewProductImport } from "../controllers/productImportController.js";

const productUrl =
    "https://www.myntra.com/shirts/brand/product/123456/buy";

function response() {
    return {
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

async function withFindOne(result, run, legacyItems = []) {
    const originalFindOne = Item.findOne;
    const originalFind = Item.find;

    Item.findOne = (filter) => ({
        select() {
            return this;
        },
        async lean() {
            return typeof result === "function" ? result(filter) : result;
        },
    });
    Item.find = (filter) => ({
        select() {
            return this;
        },
        async lean() {
            return typeof legacyItems === "function" ? legacyItems(filter) : legacyItems;
        },
    });

    try {
        await run();
    } finally {
        Item.findOne = originalFindOne;
        Item.find = originalFind;
    }
}

test("rejects an invalid URL before querying the database", async () => {
    const res = response();

    await previewProductImport(
        { body: { productUrl: "https://example.com/product/123" } },
        res
    );

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /approved source/);
});

test("returns the approved source when no item exists", async () => {
    await withFindOne(null, async () => {
        const res = response();

        await previewProductImport({ body: { productUrl } }, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.productUrl, productUrl);
        assert.equal(res.body.source.id, "myntra");
        assert.equal(res.body.existingItem, null);
    });
});

test("returns an existing item instead of creating a duplicate", async () => {
    const existingItem = {
        _id: "existing-item-id",
        name: "White Shirt",
        referralLink: productUrl,
    };

    await withFindOne(existingItem, async () => {
        const res = response();

        await previewProductImport({ body: { productUrl } }, res);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body.existingItem, existingItem);
    });
});

test("checks both the entered and normalized URL", async () => {
    const enteredUrl = `${productUrl}#details`;
    let checkedFilter;

    await withFindOne((filter) => {
        checkedFilter = filter;
        return null;
    }, async () => {
        const res = response();

        await previewProductImport(
            { body: { productUrl: enteredUrl } },
            res
        );

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.productUrl, productUrl);
        assert.deepEqual(checkedFilter.$or[1].referralLink.$in, [
            enteredUrl,
            productUrl,
        ]);
        assert.equal(checkedFilter.isActive, true);
        assert.match(checkedFilter.$or[0].productKey, /^myntra:/);
    });
});

test("finds a stored product by its stable key despite different tracking parameters", async () => {
    const url = "https://www.flipkart.com/jeans/p/example?pid=JEAHP28N4QE2GF3P&utm_source=one";
    const stored = { _id: "flipkart-item", referralLink: url };
    let checkedFilter;

    await withFindOne((filter) => {
        checkedFilter = filter;
        return stored;
    }, async () => {
        const res = response();
        await previewProductImport({ body: { productUrl: url.replace("one", "two") } }, res);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body.existingItem, stored);
        assert.match(checkedFilter.$or[0].productKey, /^flipkart:/);
    });
});

test("finds a legacy item with the same product identity", async () => {
    const stored = {
        _id: "legacy-item",
        referralLink: "https://www.flipkart.com/old-title/p/example?pid=JEAHP28N4QE2GF3P&q=blue",
    };
    let legacyFilter;

    await withFindOne(null, async () => {
        const res = response();
        await previewProductImport({
            body: { productUrl: "https://flipkart.com/new-title/p/another?pid=JEAHP28N4QE2GF3P" },
        }, res);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body.existingItem, stored);
    }, (filter) => {
        legacyFilter = filter;
        return [stored];
    });

    assert.equal(legacyFilter.productKey.$exists, false);
    assert.match(legacyFilter.referralLink.$regex, /flipkart/);
});

test("reports a database failure without claiming the preview succeeded", async () => {
    await withFindOne(() => {
        throw new Error("Database unavailable");
    }, async () => {
        const res = response();
        const originalConsoleError = console.error;
        console.error = () => {};

        try {
            await previewProductImport({ body: { productUrl } }, res);
        } finally {
            console.error = originalConsoleError;
        }

        assert.equal(res.statusCode, 500);
        assert.equal(res.body.success, false);
    });
});
