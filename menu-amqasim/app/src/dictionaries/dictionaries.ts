import arDict from "./ar.json";
import enDict from "./en.json";

const dictionaries = {
   ar: arDict,
   en: enDict,
};

export const getDictionary = (locale: "ar" | "en" | null) => {
   if (!locale) return dictionaries["ar"];
   return dictionaries[locale];
};
