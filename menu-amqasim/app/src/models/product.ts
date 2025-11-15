import mongoose, { Document, Schema } from "mongoose";
import { ALLERGIES_AR, ALLERGIES_EN } from "./content";

export interface IAddon {
   name: string;
   price: number;
}

export interface IProduct extends Document {
   name: string;
   price: number;
   description?: string;
   category: string;
   calories?: number;
   image?: string;
   allergies?: ALLERGIES_EN[] | ALLERGIES_AR[];
   addons?: IAddon[];
   createdAt: Date;
   updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
   {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String },
      category: { type: String, required: true },
      calories: { type: Number },
      image: { type: String },
      allergies: [
         {
            type: String,
            enum: [
               ...Object.values(ALLERGIES_EN),
               ...Object.values(ALLERGIES_AR),
            ],
         },
      ],
      addons: [
         {
            name: { type: String, required: true },
            price: { type: Number, required: true },
         },
      ],
   },
   { timestamps: true }
);

export default (mongoose.models && mongoose.models.Product) ||
   mongoose.model<IProduct>("Product", ProductSchema);
