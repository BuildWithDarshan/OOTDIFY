const ALLOWED_GENDERS = ["men","women"];
const ALLOWED_ITEM_TYPES = ["top","bottom","footwear","outerwear","accessory","other"];

export const validateCreateItem = async(req,res,next) => {
    const { name, price, referralLink, shoppingSite, gender, itemType, itemSubType } = req.body;

    if (!name || !price || !referralLink || !shoppingSite || !gender || !itemType || !itemSubType) {
        return res.status(400).json({
            success: false,
            message: "name, price, referralLink, shoppingSite, gender, itemType, and itemSubType are all required",
        });
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
            success: false,
            message: "Price must be a valid non-negative number",
        });
    }

    if(!ALLOWED_GENDERS.includes(gender)) {
        return res.status(400).json({
            success: false,
            message: `gender must be one of: ${ALLOWED_GENDERS.join(", ")}`,
        });
    }

    if(!ALLOWED_ITEM_TYPES.includes(itemType)) {
        return res.status(400).json({
            success: false,
            message: `itemType must be one of: ${ALLOWED_ITEM_TYPES.join(", ")}`,
        });
    }

    try {
        new URL(referralLink);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "referralLink must be a valid URL (include http:// or https://)",
        });
    }

    if(!req.file) {
        return res.status(400).json({
            success: false,
            message: "Item image is required",
        });
    }

    next();
}

export const validateUpdateItem = async(req,res,next) => {
    const { price, gender, itemType, referralLink } = req.body;

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
        return res.status(400).json({
            success: false,
            message: "Price must be a valid non-negative number",
        });
    }

    if(gender !== undefined && !ALLOWED_GENDERS.includes(gender)) {
        return res.status(400).json({
            success: false,
            message: `gender must be one of: ${ALLOWED_GENDERS.join(", ")}`,
        });
    }

    if(itemType !== undefined && !ALLOWED_ITEM_TYPES.includes(itemType)) {
        return res.status(400).json({
            success: false,
            message: `itemType must be one of: ${ALLOWED_ITEM_TYPES.join(", ")}`,
        });
    }

    if(referralLink !== undefined) {
        try {
            new URL(referralLink);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "referralLink must be a valid URL (include http:// or https://)",
            });
        }
    }

    next();
}