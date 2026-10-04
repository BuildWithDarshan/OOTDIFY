import mongoose from 'mongoose';

const communityCommentSchema = new mongoose.Schema({
    outfit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityOutfit',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: [true, "Comment Text is Required"],
        trim: true,
        maxLength: 1000,
    }
}, {timestamps: true});

communityCommentSchema.index({ outfit: 1, createdAt: -1 });
communityCommentSchema.index({ user: 1, createdAt: -1 });

const CommunityComment = mongoose.model('CommunityComment', communityCommentSchema);

export default CommunityComment;