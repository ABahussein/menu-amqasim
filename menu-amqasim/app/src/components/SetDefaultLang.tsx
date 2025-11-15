"use client";

import useLangStore from "@/store/useLangStore";
import { useEffect } from "react";

function SetDefaultLang({ langParam }: { langParam: string }) {
   const { lang, setLang } = useLangStore((state) => state);

   useEffect(() => {
      // Sync store with URL param if different
      if (lang !== langParam && (langParam === "ar" || langParam === "en")) {
         setLang(langParam);
      }
   }, []);

   return <></>;
}

export default SetDefaultLang;
