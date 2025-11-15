import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LangStoreState = {
   lang: "ar" | "en" | null;
   setLang: (lang: "ar" | "en") => void;
};

const langStore = create<LangStoreState>();
const useLangStore = langStore(
   persist(
      (set) => ({
         lang: null,
         setLang: (lang) => {
            // Save to cookie when language changes (persistent indefinitely)
            document.cookie = `preferred-lang=${lang}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;

            set(() => ({ lang }));
         },
      }),
      {
         name: "lang-storage",
      }
   )
);

export default useLangStore;
