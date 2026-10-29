import test from "node:test";
import assert from "node:assert/strict";
import { validateProductImportUrl } from "../services/productImportService.js";

test("accepts a direct product URL from an approved source", () => {
    const result = validateProductImportUrl(
        "https://www.myntra.com/shirts/brand/product/123456/buy"
    );

    assert.equal(
        result.productUrl,
        "https://www.myntra.com/shirts/brand/product/123456/buy"
    );
    assert.deepEqual(result.source, {
        id: "myntra",
        displayName: "Myntra",
        sourceType: "marketplace",
    });
});

test("preserves referral parameters and removes the page fragment", () => {
    const result = validateProductImportUrl(
        "https://www.amazon.in/dp/B0ABC12345?tag=ootdify-21#details"
    );

    assert.equal(
        result.productUrl,
        "https://www.amazon.in/dp/B0ABC12345?tag=ootdify-21"
    );
});

test("accepts current Snitch product URLs and rejects the retired domain", () => {
    const productUrl =
        "https://www.snitch.com/men-shirts/maroon-slim-fit-linen-blend-shirt-4mss3976-06/8620001427618/buy";
    const result = validateProductImportUrl(productUrl);

    assert.equal(result.productUrl, productUrl);
    assert.equal(result.source.id, "snitch");
    assert.throws(
        () => validateProductImportUrl(
            "https://www.snitch.co.in/products/maroon-slim-fit-linen-blend-shirt-4mss3976-06"
        ),
        /not from an approved source/
    );
});

test("accepts Levi's India product URLs", () => {
    for (const productUrl of [
        "https://levi.in/products/womens-728-dark-blue-wide-leg-fit-high-rise-jeans-004xm0030",
        "https://levi.in/products/womens-quilted-relaxed-fit-jacket-000eh0007?_gl=tracking",
    ]) {
        const result = validateProductImportUrl(productUrl);
        assert.equal(result.productUrl, productUrl);
        assert.equal(result.source.id, "levis");
    }

    assert.throws(
        () => validateProductImportUrl("https://levis.in/products/example"),
        /not from an approved source/
    );
});

test("accepts Nike India product URLs", () => {
    for (const productUrl of [
        "https://www.nike.in/nike-sportswear-women-s-shrunken-tracksuit-jacket/p/24826837",
        "https://www.nike.in/nike-sportswear-club-men-s-trousers/p/24931573",
    ]) {
        const result = validateProductImportUrl(productUrl);
        assert.equal(result.productUrl, productUrl);
        assert.equal(result.source.id, "nike");
    }
});

test("rejects unapproved and misleading domains", () => {
    for (const url of [
        "https://example.com/product/123",
        "https://www.myntra.com.evil.example/product/123",
    ]) {
        assert.throws(
            () => validateProductImportUrl(url),
            /not from an approved source/
        );
    }

    assert.throws(
        () => validateProductImportUrl(
            "https://myntra.com@evil.example/product/123"
        ),
        /without credentials/
    );
});

test("rejects malformed or unsafe URLs", () => {
    for (const url of [
        "",
        "not-a-url",
        "http://www.myntra.com/product/123",
        "https://user:pass@www.myntra.com/product/123",
        "https://www.myntra.com:444/product/123",
    ]) {
        assert.throws(() => validateProductImportUrl(url));
    }
});

test("rejects homepages and known search pages", () => {
    for (const url of [
        "https://www.myntra.com/",
        "https://www.myntra.com/white-shirts",
        "https://www.ajio.com/search/?text=white%20shirt",
        "https://www.amazon.in/s?k=white+shirt",
        "https://www.nike.com/in/w?q=sneakers",
        "https://www2.hm.com/en_in/search-results.html?q=shirt",
        "https://www.snitch.com/search/white%20sneakers",
    ]) {
        assert.throws(
            () => validateProductImportUrl(url),
            /direct product page URL/
        );
    }
});
