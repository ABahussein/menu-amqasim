"use client";

import { getDictionary } from "@/dictionaries/dictionaries";
import useContentStore from "@/store/useContentStore";
import useLangStore from "@/store/useLangStore";
import call from "@/utils/call";
import { useEffect, useState } from "react";
import Image from "next/image";

function FetchDynamicContent({ logo }: { logo: string | null }) {
   const setContent = useContentStore((state) => state.setContent);
   const [isFetched, setIsFetched] = useState(false);
   const { lang } = useLangStore((state) => state);
   const dict = getDictionary(lang);

   useEffect(() => {
      if (!lang) return;
      async function fetchContent() {
         try {
            const { isOk, data } = await call({
               url: `/apis/content?lang_abbr=${lang}`,
               method: "GET",
            });

            if (isOk && data) {
               const {
                  name,
                  desc,
                  logo,
                  header_images,
                  bg_image,
                  info_bar,
                  lang_abbr,
               } = data.content;
               setContent(
                  name,
                  desc,
                  logo,
                  header_images,
                  bg_image,
                  info_bar,
                  lang_abbr
               );
               setIsFetched(true);

               document.title = name || "N/A";
               // update meta description
               const metaDesc = document.querySelector(
                  'meta[name="description"]'
               );
               if (metaDesc) {
                  metaDesc.setAttribute("content", desc || "N/A");
               }
            }
         } catch (error) {
            console.error("Failed to fetch content:", error);
         }
      }
      fetchContent();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [lang]);
   return (
      <>
         {!isFetched && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-color)] backdrop-blur-sm">
               <div className="flex flex-col items-center space-y-6 p-8">
                  {/* Animated Logo/Icon */}
                  <div className="relative">
                     {logo ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg animate-pulse">
                           <Image
                              src={logo}
                              alt="Logo"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                           />
                        </div>
                     ) : (
                        <>
                           <div className="w-16 h-16 bg-gradient-to-r from-[var(--utility-color)] to-[color-mix(in_srgb,var(--utility-color)_70%,var(--product-card-bg-color))] rounded-full animate-pulse shadow-lg"></div>
                           <div className="absolute inset-0 w-16 h-16 border-4 border-[var(--utility-color)] rounded-full animate-spin border-t-transparent"></div>
                        </>
                     )}
                  </div>

                  {/* Loading Text */}
                  <div className="text-center space-y-2">
                     <h2 className="text-xl font-semibold text-[var(--text-color)] animate-pulse">
                        {dict.loading.loading_menu}
                     </h2>
                     <div className="flex space-x-1 justify-center">
                        <div className="w-2 h-2 bg-[var(--utility-color)] rounded-full animate-bounce"></div>
                        <div
                           className="w-2 h-2 bg-[var(--utility-color)] rounded-full animate-bounce"
                           style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                           className="w-2 h-2 bg-[var(--utility-color)] rounded-full animate-bounce"
                           style={{ animationDelay: "0.2s" }}
                        ></div>
                     </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-48 h-2 bg-[color-mix(in_srgb,var(--utility-color)_20%,transparent)] rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-[var(--utility-color)] to-[var(--product-card-bg-color)] rounded-full animate-pulse w-3/4 transition-all duration-1000"></div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-20 left-20 w-32 h-32 bg-[color-mix(in_srgb,var(--category-card-bg-color)_30%,transparent)] rounded-full blur-xl animate-pulse"></div>
                  <div
                     className="absolute bottom-20 right-20 w-24 h-24 bg-[color-mix(in_srgb,var(--product-card-bg-color)_40%,transparent)] rounded-full blur-lg animate-pulse"
                     style={{ animationDelay: "0.5s" }}
                  ></div>
               </div>
            </div>
         )}
      </>
   );
}

export default FetchDynamicContent;
