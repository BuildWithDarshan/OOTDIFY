import mongoose from 'mongoose';

const communityLikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    outfit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityOutfit',
        required: true,
    },
},{timestamps: {createdAt: true, updatedAt: false}});

communityLikeSchema.index({user: 1, outfit: 1}, {unique: true});

const CommunityLike = mongoose.model('CommunityLike', communityLikeSchema);

export default CommunityLike;