import mongoose, { Document, Schema } from "mongoose";

export interface ITheme extends Document {
   _id: string;
   colors: {
      bg: string;
      text: string;
      product_card_bg: string;
      category_card_bg: string;
      utility: string;
   };
   view_style: "GRID" | "LIST" | "IMAGE";
   createdAt: Date;
   updatedAt: Date;
}

const themeSchema = new Schema<ITheme>(
   {
      colors: {
         bg: { type: String, required: true, default: "#ffffff" },
         text: { type: String, required: true, default: "#000000" },
         product_card_bg: { type: String, required: true, default: "#f5f5f5" },
         category_card_bg: { type: String, required: true, default: "#e0e0e0" },
         utility: { type: String, required: true, default: "#ff4081" },
      },
      view_style: {
         type: String,
         enum: ["GRID", "LIST", "IMAGE"],
         default: "LIST",
         required: true,
      },
   },
   {
      timestamps: true,
   }
);

const Theme =
   mongoose.models.Theme || mongoose.model<ITheme>("Theme", themeSchema);

export default Theme;
