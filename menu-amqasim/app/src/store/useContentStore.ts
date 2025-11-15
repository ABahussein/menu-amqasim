import { ALLERGIES_AR, ALLERGIES_EN } from "@/models/content";
import { create } from "zustand";

export type ContentStoreState = {
   name: string | null;
   desc: string | null;
   logo: string | null;
   header_images: string[] | null;
   bg_image: string | null;
   info_bar: {
      locations?: { place: string; id?: string }[] | null;
      info: string | null;
      review: { google_map_link: string | null };
      contact: {
         phone_number: string | null;
         whatsapp_number: string | null;
         email: string | null;
      };
      social_links: {
         facebook: string | null;
         twitter: string | null;
         instagram: string | null;
         linkedin: string | null;
         youtube: string | null;
      };
      share_link: string | null;
      allergies: (ALLERGIES_EN | ALLERGIES_AR)[] | null;
   };
   lang_abbr: "en" | "ar" | null;
   setContent: (
      name: string | null,
      desc: string | null,
      logo: string | null,
      header_images: string[] | null,
      bg_image: string | null,
      info_bar: ContentStoreState["info_bar"],
      lang_abbr: "en" | "ar" | null
   ) => void;
   clearContent: () => void;
};

const useContentStore = create<ContentStoreState>((set) => ({
   name: null,
   desc: null,
   logo: null,
   header_images: null,
   bg_image: null,
   info_bar: {
      locations: null,
      info: null,
      review: { google_map_link: null },
      contact: {
         phone_number: null,
         whatsapp_number: null,
         email: null,
      },
      social_links: {
         facebook: null,
         twitter: null,
         instagram: null,
         linkedin: null,
         youtube: null,
      },
      share_link: null,
      allergies: null,
   },
   lang_abbr: null,
   setContent: (
      name,
      desc,
      logo,
      header_images,
      bg_image,
      info_bar,
      lang_abbr
   ) =>
      set(() => ({
         name,
         desc,
         logo,
         header_images,
         bg_image,
         info_bar,
         lang_abbr,
      })),
   clearContent: () =>
      set(() => ({
         name: null,
         desc: null,
         logo: null,
         header_images: null,
         bg_image: null,
         info_bar: {
            locations: null,
            info: null,
            review: { google_map_link: null },
            contact: {
               phone_number: null,
               whatsapp_number: null,
               email: null,
            },
            social_links: {
               facebook: null,
               twitter: null,
               instagram: null,
               linkedin: null,
               youtube: null,
            },
            share_link: null,
            allergies: null,
         },
         lang_abbr: null,
      })),
}));
export default useContentStore;
