import mongoose from "mongoose"

const outfitTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Outfit type name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

outfitTypeSchema.pre('validate', function () {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().trim().replace(/\s+/g, '-');
  }
});

const OutfitType = mongoose.model("OutfitType", outfitTypeSchema);

export default OutfitType;