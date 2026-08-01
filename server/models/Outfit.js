import mongoose from "mongoose";

const outfitSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true,'Name is required'],
            trim: true,
        },
        coverImage : {
            url: {type: String, required: [true, 'Cover Image is required']},
            publicId : {type: String},
        },
        gender: {
            type: String,
            enum: ['men','women'],
            required: true,
        },
        occasion : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Occasion',
            required: true,
        },
        outfitType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OutfitType',
            required: true,
        },
        season : {
            type: String,
            enum: ['summer','winter','monsoon','all-season'],
            default: 'all-season',
        },
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item',
            },
        ],
        totalPrice: {
            type: Number,
            required: true, 
            min: 0
        },
        description : {
            type: String,
            trim: true,
        },
        isOOTD : {
            type: Boolean,
            default: false,
        },
        ootdDate: {
            type: Date,
        },
        isTrending : {
            type: Boolean,
            default: false,
        },
        isCelebrityInspired: {
            type: Boolean,
            default: false,
        },
        inspiredByLabel: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
},{timestamps: true},
);

outfitSchema.index({ gender: 1, occasion: 1, outfitType: 1, season: 1, totalPrice: 1 });
outfitSchema.index({ gender: 1, isOOTD: 1, ootdDate: -1 });
outfitSchema.index({ isTrending: 1 });

const Outfit = mongoose.model("Outfit", outfitSchema);

export default Outfit;