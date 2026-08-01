import mongoose from "mongoose"

const styleTipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    coverImage: {
      url: { type: String, required: [true, 'Cover image is required'] },
      publicId: { type: String },
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      enum: [
        'color-combinations',
        'styling-mistakes',
        'outfit-coordination',
        'seasonal-dressing',
        'accessories',
        'general',
      ],
      default: 'general',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

styleTipSchema.pre('validate', function () {
  if (this.title && !this.slug) {
    this.slug = this.title.toLowerCase().trim().replace(/\s+/g, '-');
  }
});

styleTipSchema.index({ category: 1, isActive: 1 });

const StyleTip = mongoose.model("StyleTip", styleTipSchema);

export default StyleTip;