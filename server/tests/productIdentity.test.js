import test from "node:test";
import assert from "node:assert/strict";
import Item from "../models/Item.js";
import { getProductIdentity } from "../services/productIdentityService.js";

const key = (url) => getProductIdentity(url)?.key;

test("Flipkart uses pid across titles, domains and tracking parameters", () => {
    const first = "https://www.flipkart.com/old-title/p/one?pid=JEAHP28N4QE2GF3P&q=blue";
    const second = "https://flipkart.com/new-title/p/two?pid=JEAHP28N4QE2GF3P&utm_source=search";
    const different = "https://flipkart.com/new-title/p/two?pid=JCKHS9GWHBMYRYZF";

    assert.equal(key(first), key(second));
    assert.notEqual(key(first), key(different));
    assert.equal(getProductIdentity(first).productId, "JEAHP28N4QE2GF3P");
});

test("Shopify product variants stay distinct while search context is ignored", () => {
    const base = "https://offduty.in/products/fade-dusk-blue-wide-leg-jeans";
    assert.equal(
        key(`${base}?variant=42172909453409&_pos=2&_sid=one&_ss=r`),
        key(`${base}?_sid=two&variant=42172909453409`)
    );
    assert.notEqual(key(`${base}?variant=42172909453409`), key(`${base}?variant=other`));
    assert.notEqual(key(base), key(`${base}?variant=42172909453409`));
});

test("Savana product ID and colour, Zara version, and Amazon ASIN are retained", () => {
    const savana = "https://www.savana.com/details/high-waist-vintage-dark-wash-wide-leg-jeans-2071142";
    assert.notEqual(key(`${savana}?vid=484`), key(`${savana}?vid=318`));
    assert.notEqual(key(`${savana}?vid=484`), key(savana.replace("2071142", "2014312") + "?vid=484"));

    const zara = "https://www.zara.com/in/en/leather-effect-jacket-p04391892.html";
    assert.notEqual(key(`${zara}?v1=595901330`), key(`${zara}?v1=other`));

    assert.equal(
        key("https://www.amazon.in/example/dp/B0HKN9W8ZG?tag=old"),
        key("https://amazon.in/dp/B0HKN9W8ZG?tag=new")
    );
});

test("unknown query parameters remain distinct on unrecognized page shapes", () => {
    const url = "https://www.flipkart.com/unusual-product/page";
    assert.equal(key(`${url}?utm_source=one&color=blue`), key(`${url}?color=blue&utm_source=two`));
    assert.notEqual(key(`${url}?color=blue`), key(`${url}?color=black`));
});

test("invalid or unapproved links do not receive a product key", () => {
    assert.equal(getProductIdentity("https://example.com/product/123"), null);
    assert.equal(getProductIdentity("https://www.flipkart.com/search?q=jeans"), null);
});

test("new catalog items derive product keys before validation", async () => {
    const item = new Item({
        name: "Wide-leg jeans",
        image: { url: "https://example.com/image.jpg" },
        price: 1000,
        referralLink: "https://www.flipkart.com/jeans/p/one?pid=JEAHP28N4QE2GF3P",
        shoppingSite: "Flipkart",
        gender: "women",
        itemType: "bottom",
        itemSubType: "wide-leg jeans",
    });

    await item.validate();
    assert.equal(item.productKey, key(item.referralLink));
});
