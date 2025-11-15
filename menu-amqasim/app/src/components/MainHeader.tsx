"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import useLangStore from "@/store/useLangStore";
import { getDictionary } from "@/dictionaries/dictionaries";
import Button from "@/components/Button";
import useUserStore, { UserStoreState } from "@/store/useUserStore";

function MainHeader() {
   const { lang, setLang } = useLangStore((state) => state);
   const router = useRouter();
   const pathname = usePathname();
   const dict = getDictionary(lang);
   const { token, clearUser, username, role } = useUserStore(
      (state) => state
   ) as UserStoreState;

   const handleLanguageChange = (newLang: "ar" | "en") => {
      setLang(newLang);
      // Navigate to the same page but with new language
      const currentPath = window.location.pathname;
      const pathWithoutLang = currentPath.replace(/^\/(ar|en)/, "");
      router.push(`/${newLang}${pathWithoutLang}`);
   };

   return (
      <div className="container">
         <div className="main-header">
            <div className="flex -mx-1 items-center justify-between bg-[color-mix(in_srgb,var(--bg-color)_95%,black)] p-1.5 px-2.5">
               {/* Language Switcher */}
               <div className="language-switcher flex items-center bg-[var(--bg-color)] rounded-full p-0.5">
                  <button
                     onClick={() => handleLanguageChange("en")}
                     title="English"
                     className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 text-xs font-semibold ${
                        lang === "en"
                           ? "bg-white text-[var(--text-color)] shadow-sm"
                           : "text-[var(--text-color)] hover:text-[var(--utility-color)]"
                     }`}
                  >
                     E
                  </button>
                  <button
                     onClick={() => handleLanguageChange("ar")}
                     title="العربية"
                     className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 text-xs font-semibold ${
                        lang === "ar"
                           ? "bg-white text-[var(--text-color)] shadow-sm"
                           : "text-[var(--text-color)] hover:text-[var(--utility-color)]"
                     }`}
                  >
                     ع
                  </button>
               </div>

               {/* Right Section */}
               {token ? (
                  <div className="flex items-center gap-4">
                     <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[color-mix(in_srgb,var(--utility-color)_10%,transparent)] rounded-full border border-[color-mix(in_srgb,var(--utility-color)_20%,transparent)]">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-[var(--text-color)]">
                           @{username}
                        </span>
                     </div>
                     {/* Manage/Home Link for SUPERADMIN */}
                     {role === "SUPERADMIN" && (
                        <Button
                           variant="secondary"
                           size="sm"
                           rounded
                           onClick={() => {
                              const isOnManagePage =
                                 pathname?.includes("/manage");
                              if (isOnManagePage) {
                                 router.push(`/${lang || "en"}`);
                              } else {
                                 router.push(`/${lang || "en"}/manage`);
                              }
                           }}
                        >
                           {pathname?.includes("/manage")
                              ? dict.main_header.home
                              : dict.main_header.manage}
                        </Button>
                     )}

                     <button
                        onClick={clearUser}
                        title={dict.main_header.logout}
                        className="p-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 transition-all duration-200 group"
                     >
                        <LogOut
                           size={16}
                           className="group-hover:scale-110 transition-transform duration-200"
                        />
                     </button>
                  </div>
               ) : (
                  <button
                     onClick={() => router.push(`/${lang || "en"}/login`)}
                     title={dict.main_header.login}
                     className="p-1.5 rounded-full bg-[var(--utility-color)]/10 text-[var(--utility-color)] hover:bg-[var(--utility-color)]/20 hover:text-[var(--utility-color)] transition-all duration-200 group"
                  >
                     <User
                        size={16}
                        className="group-hover:scale-110 transition-transform duration-200"
                     />
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}

export default MainHeader;
