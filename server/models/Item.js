import mongoose from "mongoose";

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

const Item = mongoose.model("Item", itemSchema);

export default Item;