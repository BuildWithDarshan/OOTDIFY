import mongoose from "mongoose"

const trendSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Trend title is required'],
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
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    stylingTips: [
      {
        type: String,
      },
    ],
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex'],
      default: 'unisex',
    },
    relatedOutfits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Outfit',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

trendSchema.pre('validate', function () {
  if (this.title && !this.slug) {
    this.slug = this.title.toLowerCase().trim().replace(/\s+/g, '-');
  }
});

trendSchema.index({ gender: 1, isActive: 1 });

const Trend = mongoose.model("Trend", trendSchema);

export default Trend;