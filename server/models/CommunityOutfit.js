import mongoose from 'mongoose';

const isOptionalHttpUrl = (value) => {
    if(!value) return true;

    try{
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    }catch {
        return false;
    }
};

const optionalUrlField = {
    type: String,
    trim: true,
    default: "",
    validate: {
        validator: isOptionalHttpUrl,
        message: "Must be a valid HTTP or HTTPS URL",
    },
};

const communityOutfitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    image: {
        url: {
            type: String,
            required: [true, "Outfit Image is Required"],
        },
        publicId: {
            type: String,
            required: [true, "Outfit Image Public ID is Required"],
        }
    },
    title: {
        type: String,
        required: [true, "Outfit Title is Required"],
        trim: true,
        maxLength: 120,
    },
    description: {
        type: String,
        trim: true,
        maxLength: 2000,
        default: "",
    },
    gender: {
        type: String,
        enum: ["men", "women", "unisex"],
        required: [true, "Gender is Required"],
    },
    outfitType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OutfitType",
        required: true,
    },
    occasion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Occasion",
        required: true,
    },
    tags: {
        type: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
        default: [],
    },
    productLinks : {
        topwear: {...optionalUrlField},
        bottomwear: {...optionalUrlField},
        footwear: {...optionalUrlField},
    },
    likeCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    saveCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    commentCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    isVisible: {
        type: Boolean,
        default: true,
    },
}, {timestamps: true});

communityOutfitSchema.index({isVisible: 1, createdAt: -1});
communityOutfitSchema.index({isVisible: 1, gender: 1, createdAt: -1});
communityOutfitSchema.index({ outfitType: 1, occasion: 1 });
communityOutfitSchema.index({ tags: 1 });

const CommunityOutfit = mongoose.model('CommunityOutfit', communityOutfitSchema);

export default CommunityOutfit;