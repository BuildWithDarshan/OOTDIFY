import { createHash } from "node:crypto";
import { validateProductImportUrl } from "./productImportService.js";

const SHOPIFY_SOURCES = new Set([
    "offduty", "urbano-fashion", "bonkers-corner", "bluorng", "levis",
]);
const SLUG_SOURCES = new Set(["the-souled-store", "bewakoof"]);
const TRACKING_PARAMETER = /^(?:utm_.+|_pos|_sid|_ss|_gl|gclid|fbclid|ref|tag|affid)$/i;

function lastMatch(pathname, pattern) {
    return pathname.match(pattern)?.[1] ?? null;
}

function fallbackId(url) {
    const params = [...url.searchParams]
        .filter(([name]) => !TRACKING_PARAMETER.test(name))
        .sort(([leftName, leftValue], [rightName, rightValue]) =>
            leftName.localeCompare(rightName) || leftValue.localeCompare(rightValue)
        );
    const query = new URLSearchParams(params).toString();
    return `${url.pathname.replace(/\/+$/, "")}${query ? `?${query}` : ""}`;
}

/** Return a stable identity only for an approved, direct product URL. */
export function getProductIdentity(value) {
    let validated;
    try {
        validated = validateProductImportUrl(value);
    } catch {
        return null;
    }

    const url = new URL(validated.productUrl);
    const sourceId = validated.source.id;
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, "");
    let productId = null;
    let variantId = null;

    switch (sourceId) {
        case "flipkart":
            productId = url.searchParams.get("pid")?.match(/^[a-z0-9]+$/i)?.[0]?.toUpperCase() ?? null;
            break;
        case "amazon-fashion":
            productId = lastMatch(path, /\/(?:dp|gp\/product|gp\/aw\/d)\/([a-z0-9]{10})(?:\/|$)/i)?.toUpperCase() ?? null;
            break;
        case "myntra":
        case "snitch":
            productId = lastMatch(path, /\/(\d+)\/buy$/i);
            break;
        case "ajio":
            productId = lastMatch(path, /\/p\/([^/]+)$/i)?.toLowerCase() ?? null;
            break;
        case "tata-cliq":
            productId = lastMatch(path, /\/(p-mp\d+)$/i)?.toLowerCase() ?? null;
            break;
        case "savana":
            productId = lastMatch(path, /-(\d+)$/);
            variantId = url.searchParams.get("vid") || url.searchParams.get("skcPGs");
            break;
        case "hm":
            productId = lastMatch(path, /productpage\.(\d+)\.html$/i);
            break;
        case "zara":
            productId = lastMatch(path, /-(p\d+)\.html$/i)?.toLowerCase() ?? null;
            variantId = url.searchParams.get("v1");
            break;
        case "nike":
            productId = lastMatch(path, /\/p\/([a-z0-9-]+)$/i)?.toLowerCase() ?? null;
            break;
        default:
            if (SHOPIFY_SOURCES.has(sourceId)) {
                productId = lastMatch(path, /\/products\/([^/]+)$/i)?.toLowerCase() ?? null;
                variantId = url.searchParams.get("variant");
            } else if (SLUG_SOURCES.has(sourceId)) {
                productId = lastMatch(path, /\/(?:product|p)\/([^/]+)$/i)?.toLowerCase() ?? null;
            }
    }

    // An unrecognized page shape stays distinct unless its meaningful query
    // parameters also match. This avoids merging products on ambiguous pages.
    productId ??= fallbackId(url);
    const host = url.hostname.replace(/^www\d*\./i, "").toLowerCase();
    const parts = [sourceId, host, productId, variantId || ""];
    const digest = createHash("sha256").update(JSON.stringify(parts)).digest("hex");

    return { key: `${sourceId}:${digest}`, sourceId, productId, variantId: variantId || null };
}
