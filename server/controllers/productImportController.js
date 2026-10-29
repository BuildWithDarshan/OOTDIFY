import Item from "../models/Item.js";
import { getApprovedRetailerById } from "../config/approvedRetailers.js";
import { validateProductImportUrl } from "../services/productImportService.js";
import { getProductIdentity } from "../services/productIdentityService.js";

const ITEM_FIELDS =
    "name image price referralLink shoppingSite brand " +
    "gender itemType itemSubType isWardrobeEssential";

function sourceUrlPattern(sourceId) {
    const domains = getApprovedRetailerById(sourceId).domains.map((domain) =>
        domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    return `^https://(?:${domains.join("|")})/`;
}

export async function previewProductImport(req, res) {
    let validated;

    try {
        validated = validateProductImportUrl(req.body?.productUrl);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    try {
        const enteredUrl = req.body.productUrl.trim();
        const identity = getProductIdentity(validated.productUrl);
        const urlVariants = [
            ...new Set([enteredUrl, validated.productUrl]),
        ];

        let existingItem = await Item.findOne({
            isActive: true,
            $or: [
                { productKey: identity.key },
                { referralLink: { $in: urlVariants } },
            ],
        })
            .select(ITEM_FIELDS)
            .lean();

        // Existing catalog rows predate productKey. Compare their approved
        // product URLs in memory until they are edited or migrated.
        if (!existingItem) {
            const legacyItems = await Item.find({
                isActive: true,
                productKey: { $exists: false },
                referralLink: {
                    $regex: sourceUrlPattern(validated.source.id),
                    $options: "i",
                },
            }).select(ITEM_FIELDS).lean();

            existingItem = legacyItems.find((item) =>
                getProductIdentity(item.referralLink)?.key === identity.key
            ) ?? null;
        }

        return res.status(200).json({
            success: true,
            productUrl: validated.productUrl,
            source: validated.source,
            existingItem: existingItem ?? null,
        });
    } catch (error) {
        console.error("Failed to preview product import:", error);

        return res.status(500).json({
            success: false,
            message: "Could not check this product against the catalog.",
        });
    }
}
