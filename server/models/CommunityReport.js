import mongoose from 'mongoose';

const communityReportSchema = new mongoose.Schema({
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
    reason: {
        type: String,
        enum: ["spam","inappropriate","copyright","harassment","other",],
        required: [true, "Report Reason is Required"],
    },
    details: {
        type: String,
        trim: true,
        maxLength: 1000,
        default: "",
    },
    status: {
        type: String,
        enum: ["pending", "dismissed", "actioned"],
        default: "pending",
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewedAt: {
        type: Date,
    },
    moderatorNote: {
        type: String,
        trim: true,
        maxLength: 1000,
        default: "",
    }
},{timestamps: true});

communityReportSchema.index(
    { user: 1, outfit: 1 },
    { unique: true },
);

communityReportSchema.index({ status: 1, createdAt: -1 });
communityReportSchema.index({ outfit: 1, status: 1 });

const CommunityReport = mongoose.model('CommunityReport', communityReportSchema);

export default CommunityReport;