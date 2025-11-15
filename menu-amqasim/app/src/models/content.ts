import mongoose, { Document, Schema } from "mongoose";

export enum ALLERGIES_EN {
   FISH = "FISH",
   EGGS = "EGGS",
   GLUTEN = "GLUTEN",
   MILK = "MILK",
   NUTS = "NUTS",
   CRUSTACEANS = "CRUSTACEANS",
   MUSTARD = "MUSTARD",
   MOLLUSCS = "MOLLUSCS",
   PEANUTS = "PEANUTS",
   SULFITES_10 = "SULFITES_10",
   CELERY = "CELERY",
   SOYBEANS = "SOYBEANS",
   LUPIN = "LUPIN",
}

export enum ALLERGIES_AR {
   FISH = "سمك",
   EGGS = "بيض",
   GLUTEN = "جلوتين",
   MILK = "حليب",
   NUTS = "مكسرات",
   CRUSTACEANS = "قشريات",
   MUSTARD = "خردل",
   MOLLUSCS = "رخويات",
   PEANUTS = "فول سوداني",
   SULFITES_10 = "كبريتات 10",
   CELERY = "كرفس",
   SOYBEANS = "فول الصويا",
   LUPIN = "لوبين",
}

export interface IContent extends Document {
   name?: string;
   desc?: string;
   logo?: string;
   header_images?: string[];
   info_bar?: {
      locations?: { place: string; id?: string }[];
      info?: string;
      review?: { google_map_link: string };
      contact?: {
         phone_number?: string;
         whatsapp_number?: string;
         email?: string;
      };
      social_links?: {
         facebook?: string;
         twitter?: string;
         instagram?: string;
         linkedin?: string;
         youtube?: string;
      };
      share_link?: string;
      allergies?: ALLERGIES_EN[] | ALLERGIES_AR[];
   };
   bg_image?: string;
   lang_abbr: "en" | "ar";
   createdAt: Date;
   updatedAt: Date;
}

const ContentSchema: Schema = new Schema(
   {
      name: { type: String },
      desc: { type: String },
      logo: { type: String },
      header_images: { type: [String], default: [] },
      bg_image: { type: String },
      info_bar: {
         locations: [
            {
               place: { type: String },
               id: { type: String },
            },
         ],
         info: { type: String },
         review: {
            google_map_link: { type: String },
         },
         contact: {
            phone_number: { type: String },
            whatsapp_number: { type: String },
            email: { type: String },
         },
         social_links: {
            facebook: { type: String },
            twitter: { type: String },
            instagram: { type: String },
            linkedin: { type: String },
            youtube: { type: String },
         },
         share_link: { type: String },
         allergies: {
            type: [String],
            enum: Object.values(ALLERGIES_EN)
               .map(String)
               .concat(Object.values(ALLERGIES_AR).map(String)),
         },
      },
      lang_abbr: { type: String, enum: ["en", "ar"], default: "ar" },
   },
   { timestamps: true }
);

export default (mongoose.models && mongoose.models.Content) ||
   mongoose.model<IContent>("Content", ContentSchema);
