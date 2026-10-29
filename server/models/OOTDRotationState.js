import mongoose from "mongoose";

const ootdRotationStateSchema = new mongoose.Schema({
    _id: { type: String, enum: ["men", "women"], required: true },
    dayKey: { type: String, default: "" },
    selectedOutfit: { type: mongoose.Schema.Types.ObjectId, ref: "Outfit", default: null },
    leaseToken: { type: String, default: null },
    leaseUntil: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("OOTDRotationState", ootdRotationStateSchema);
