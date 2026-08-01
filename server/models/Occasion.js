import mongoose from "mongoose";

const occasionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true,'Occasion Name is required'],
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
        isActive : {
            type: Boolean,
            default: true,
        },
    },{timestamps: true}
);

occasionSchema.pre('validate', function () {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().trim().replace(/\s+/g, '-');
  }
});

const Occasion = mongoose.model("Occasion", occasionSchema);

export default Occasion;