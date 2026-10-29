import { getApprovedRetailers } from "../config/approvedRetailers.js";

const MAX_URL_LENGTH = 2048;
const SEARCH_PATH = /(?:^|\/)(?:search|search-results(?:\.html)?|s)(?:\/|$)/i;

export function validateProductImportUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error("Enter a product URL.");
    }

    const input = value.trim();

    if (input.length > MAX_URL_LENGTH || /\s/.test(input)) {
        throw new Error("Enter a product URL of 2048 characters or fewer, without spaces.");
    }

    let url;
    try {
        url = new URL(input);
    } catch {
        throw new Error("Enter a valid product URL, including https://.");
    }

    if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        url.port
    ) {
        throw new Error(
            "Use an HTTPS product URL without credentials or a custom port."
        );
    }

    // Compare the parsed hostname exactly. A name such as
    // myntra.com.evil.example must never match myntra.com.
    const source = getApprovedRetailers().find((entry) =>
        entry.domains.some(
            (domain) => domain.toLowerCase() === url.hostname.toLowerCase()
        )
    );

    if (!source) {
        throw new Error("This URL is not from an approved source.");
    }

    let pathname;
    try {
        pathname = decodeURIComponent(url.pathname);
    } catch {
        throw new Error("The product URL contains an invalid path.");
    }

    const segments = pathname.split("/").filter(Boolean);
    const isHomepage = segments.length === 0;
    const isKnownSearchPage =
        SEARCH_PATH.test(pathname) ||
        (source.id === "nike" && pathname === "/in/w") ||
        (source.id === "myntra" && segments.length === 1);

    if (isHomepage || isKnownSearchPage) {
        throw new Error(
            "Paste a direct product page URL, not a homepage or search results link."
        );
    }

    // A page fragment is not part of the product identity. Keep query
    // parameters because they may contain a legitimate referral code.
    url.hash = "";

    return {
        productUrl: url.href,
        source: {
            id: source.id,
            displayName: source.displayName,
            sourceType: source.sourceType,
        },
    };
}