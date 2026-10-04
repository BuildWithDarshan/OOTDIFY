import mongoose from 'mongoose';

const communitySaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    outfit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityOutfit',
        required: true,
    }
},{timestamps: {createdAt: true, updatedAt: false}});

communitySaveSchema.index({user: 1, outfit: 1}, {unique: true});

const CommunitySave = mongoose.model('CommunitySave', communitySaveSchema);

export default CommunitySave;