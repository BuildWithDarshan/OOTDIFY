import mongoose from "mongoose";

const clickSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    outfit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outfit',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    shoppingSite: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    ip: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

clickSchema.index({ item: 1, createdAt: -1 });
clickSchema.index({ outfit: 1, createdAt: -1 });

const Click = mongoose.model("Click", clickSchema);

export default Click;