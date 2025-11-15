import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
   name: string;
   image?: string;
   description?: string;
   lang_abbr?: "en" | "ar";
   createdAt: Date;
   updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
   {
      name: { type: String, required: true },
      image: { type: String },
      description: { type: String },
      lang_abbr: { type: String, enum: ["en", "ar"], default: "ar" },
   },
   { timestamps: true }
);

export default (mongoose.models && mongoose.models.Category) ||
   mongoose.model<ICategory>("Category", CategorySchema);
