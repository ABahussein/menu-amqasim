import { BACKEND_URL } from "@/config";
import call from "./call";

export const getLogo = async () => {
   try {
      const res = await call({
         url: BACKEND_URL + "/apis/content",
         method: "GET",
      });
      const { isOk, data } = res;

      if (!isOk) {
         return null;
      }

      if (data && data.content) {
         return data.content.logo || null;
      }
   } catch (error) {
      console.error("Error fetching background image:", error);
   }

   return null;
};
