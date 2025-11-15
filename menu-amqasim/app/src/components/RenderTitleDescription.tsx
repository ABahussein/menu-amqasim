"use client";

import useContentStore from "@/store/useContentStore";
import { useEffect } from "react";

function RenderTitleDescription() {
   const { name, desc } = useContentStore((state) => state);

   useEffect(() => {
      if (name) {
         document.title = name || "N/A";
      }
      if (desc) {
         const metaDesc = document.querySelector('meta[name="description"]');
         if (metaDesc) {
            metaDesc.setAttribute("content", desc || "N/A");
         }
      }
   }, [name, desc]);
   return <></>;
}

export default RenderTitleDescription;
