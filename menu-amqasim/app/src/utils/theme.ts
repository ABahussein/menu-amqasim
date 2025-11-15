import { BACKEND_URL } from "@/config";
import call from "./call";

async function fetchTheme() {
   try {
      const { isOk, data } = await call({
         url: BACKEND_URL + "/apis/manage/theme",
         method: "GET",
      });

      if (!isOk) {
         return null;
      }

      if (data) {
         return data.theme;
      }
   } catch (error) {
      console.error("Error fetching theme:", error);
   }
}

export const getThemeColors = async () => {
   const theme = await fetchTheme();

   if (theme) {
      return theme.colors;
   }

   return {
      bg: "#eee",
      text: "#333",
      product_card_bg: "#b8e5ff",
      category_card_bg: "#b8e5ff",
      utility: "#456274",
   };
};

export const getBgImage = async () => {
   try {
      const { isOk, data } = await call({
         url: BACKEND_URL + "/apis/content",
         method: "GET",
      });

      if (!isOk) {
         return null;
      }

      if (data && data.content) {
         return data.content.bg_image || null;
      }
   } catch (error) {
      console.error("Error fetching background image:", error);
   }
   
   return null;
};

export const getViewStyle = async () => {
   const theme = await fetchTheme();

   return theme?.view_style || "GRID";
};
