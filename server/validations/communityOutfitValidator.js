import mongoose from "mongoose";

const ALLOWED_GENDERS = ["men", "women", "unisex"];
const PRODUCT_LINK_CATEGORIES = ["topwear", "bottomwear", "footwear"];
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 40;

const sendBadRequest = (res, message) =>
    res.status(400).json({ success: false, message });

const parseJsonField = (value, fieldName) => {
    if (typeof value !== "string") {
        return { value, error: null };
    }

    try {
        return { value: JSON.parse(value), error: null };
    } catch {
        return {
            value: undefined,
            error: `${fieldName} must be valid JSON`,
        };
    }
};

const isOptionalHttpUrl = (value) => {
    if (typeof value !== "string") return false;

    const trimmedValue = value.trim();
    if (!trimmedValue) return true;

    try {
        const url = new URL(trimmedValue);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

const validateCommunityOutfit = (req, res, next, isUpdate) => {
    const {
        title,
        description,
        gender,
        occasion,
        outfitType,
        tags,
        productLinks,
    } = req.body;

    if (!isUpdate && (!title || !gender || !occasion || !outfitType)) {
        return sendBadRequest(
            res,
            "title, gender, occasion, and outfitType are required",
        );
    }

    if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
            return sendBadRequest(res, "title must not be empty");
        }

        if (title.trim().length > 120) {
            return sendBadRequest(res, "title must be 120 characters or fewer");
        }
    }

    if (description !== undefined) {
        if (typeof description !== "string") {
            return sendBadRequest(res, "description must be a string");
        }

        if (description.length > 2000) {
            return sendBadRequest(
                res,
                "description must be 2000 characters or fewer",
            );
        }
    }

    if (gender !== undefined && !ALLOWED_GENDERS.includes(gender)) {
        return sendBadRequest(
            res,
            `gender must be one of: ${ALLOWED_GENDERS.join(", ")}`,
        );
    }

    if (
        occasion !== undefined &&
        !mongoose.Types.ObjectId.isValid(occasion)
    ) {
        return sendBadRequest(res, "occasion must be a valid id");
    }

    if (
        outfitType !== undefined &&
        !mongoose.Types.ObjectId.isValid(outfitType)
    ) {
        return sendBadRequest(res, "outfitType must be a valid id");
    }

    if (tags !== undefined) {
        const parsedTags = parseJsonField(tags, "tags");

        if (parsedTags.error) {
            return sendBadRequest(res, parsedTags.error);
        }

        if (
            !Array.isArray(parsedTags.value) ||
            parsedTags.value.length > MAX_TAGS ||
            parsedTags.value.some(
                (tag) =>
                    typeof tag !== "string" ||
                    !tag.trim() ||
                    tag.trim().length > MAX_TAG_LENGTH,
            )
        ) {
            return sendBadRequest(
                res,
                `tags must be an array of up to ${MAX_TAGS} non-empty strings, each ${MAX_TAG_LENGTH} characters or fewer`,
            );
        }

        req.body.tags = parsedTags.value.map((tag) => tag.trim().toLowerCase());
    }

    if (productLinks !== undefined) {
        const parsedLinks = parseJsonField(productLinks, "productLinks");

        if (parsedLinks.error) {
            return sendBadRequest(res, parsedLinks.error);
        }

        const links = parsedLinks.value;

        if (
            !links ||
            typeof links !== "object" ||
            Array.isArray(links)
        ) {
            return sendBadRequest(
                res,
                "productLinks must be an object",
            );
        }

        const unknownCategories = Object.keys(links).filter(
            (category) => !PRODUCT_LINK_CATEGORIES.includes(category),
        );

        if (unknownCategories.length > 0) {
            return sendBadRequest(
                res,
                `productLinks may only contain: ${PRODUCT_LINK_CATEGORIES.join(", ")}`,
            );
        }

        for (const [category, url] of Object.entries(links)) {
            if (!isOptionalHttpUrl(url)) {
                return sendBadRequest(
                    res,
                    `productLinks.${category} must be a valid HTTP or HTTPS URL`,
                );
            }
        }

        req.body.productLinks = links;
    }

    if (!isUpdate && !req.file) {
        return sendBadRequest(res, "Outfit image is required");
    }

    next();
};

export const validateCreateCommunityOutfit = (req, res, next) =>
    validateCommunityOutfit(req, res, next, false);

export const validateUpdateCommunityOutfit = (req, res, next) =>
    validateCommunityOutfit(req, res, next, true);