import mongoose from "mongoose";
import { getProductIdentity } from "../services/productIdentityService.js";

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true,'Item Name is required'],
            trim: true,
        },
        image: {
            url: {type:String, required: [true,'Item Image is required']},
            publicId: {type: String},
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
        },
        referralLink: {
            type: String,
            required: [true, 'Referral Link is required'],
        },
        productKey: {
            type: String,
            select: false,
        },
        shoppingSite: {
            type: String,
            required: [true, 'Shopping site is required'],
        },
        brand: {
            type: String,
            trim: true,
        },
        gender: {
            type: String,
            enum: ['men', 'women'],
            required: true,
        },
        itemType: {
            type: String,
            enum: ['top', 'bottom', 'footwear', 'outerwear', 'accessory', 'other'],
            required: true,
        },
        itemSubType: {
            type: String,
            required: true,
            trim: true,
        },
        isWardrobeEssential: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true}
);

itemSchema.index({ isWardrobeEssential: 1, gender: 1 });
itemSchema.index({ gender: 1, itemType: 1 });
itemSchema.index(
    { productKey: 1 },
    {
        unique: true,
        partialFilterExpression: {
            isActive: true,
            productKey: { $type: "string" },
        },
    }
);

itemSchema.pre("validate", function () {
    if (this.isNew || this.isModified("referralLink") || this.isModified("isActive")) {
        this.productKey = getProductIdentity(this.referralLink)?.key ?? undefined;
    }
});

const Item = mongoose.model("Item", itemSchema);

export default Item;
