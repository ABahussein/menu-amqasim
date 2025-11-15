"use client";

import { getDictionary } from "@/dictionaries/dictionaries";
import useUserStore from "@/store/useUserStore";
import call from "@/utils/call";
import React, { useEffect, useState } from "react";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import { Palette, Eye, Grid3X3, List, Image, Paintbrush } from "lucide-react";

interface Theme {
   _id: string;
   colors: {
      bg: string;
      text: string;
      product_card_bg: string;
      category_card_bg: string;
      utility: string;
   };
   view_style: "GRID" | "LIST" | "IMAGE";
   createdAt: string;
   updatedAt: string;
}

function ThemeSection({ lang }: { lang: string }) {
   const dict = getDictionary(lang as "ar" | "en");
   const [theme, setTheme] = useState<Theme | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const [colorsLoading, setColorsLoading] = useState(false);
   const [viewStyleLoading, setViewStyleLoading] = useState(false);

   const { token } = useUserStore((state) => state);

   // Fetch current theme from API
   useEffect(() => {
      async function fetchTheme() {
         try {
            const { isOk, data, msg } = await call({
               url: "/apis/manage/theme",
               method: "GET",
            });

            if (!isOk) {
               setError(msg);
            }

            if (data) {
               setTheme(data.theme);
               setError(null);
            }
         } catch (error) {
            console.error("Error fetching theme:", error);
            setError(dict.manage_page.theme_section.error_fetching);
         }
      }
      fetchTheme();
   }, [dict.manage_page.theme_section.error_fetching]);

   const handleColorsSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setColorsLoading(true);
      setError(null);
      setSuccess(null);

      // Get form data
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const colors = {
         bg: formData.get("bg") as string,
         text: formData.get("text") as string,
         product_card_bg: formData.get("product_card_bg") as string,
         category_card_bg: formData.get("category_card_bg") as string,
         utility: formData.get("utility") as string,
      };

      try {
         const { isOk, data, msg } = await call({
            url: "/apis/manage/theme",
            method: "PUT",
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ colors }),
         });

         if (!isOk) {
            setError(msg);
         } else if (data) {
            setSuccess(dict.manage_page.theme_section.theme_updated);
            setTheme(data.theme);
            // refresh the page to apply new theme
            window.location.reload();
         }
      } catch (error) {
         console.error("Error updating colors:", error);
         setError(dict.manage_page.theme_section.error_updating);
      } finally {
         setColorsLoading(false);
      }
   };

   const handleViewStyleUpdate = async (
      newViewStyle: "GRID" | "LIST" | "IMAGE"
   ) => {
      setViewStyleLoading(true);
      setError(null);
      setSuccess(null);

      try {
         const { isOk, data, msg } = await call({
            url: "/apis/manage/theme",
            method: "PUT",
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ view_style: newViewStyle }),
         });

         if (!isOk) {
            setError(msg);
         } else if (data) {
            setSuccess(dict.manage_page.theme_section.theme_updated);
            setTheme(data.theme);
         }
      } catch (error) {
         console.error("Error updating view style:", error);
         setError(dict.manage_page.theme_section.error_updating);
      } finally {
         setViewStyleLoading(false);
      }
   };

   const getViewStyleIcon = (viewStyle: string) => {
      switch (viewStyle) {
         case "GRID":
            return Grid3X3;
         case "LIST":
            return List;
         case "IMAGE":
            return Image;
         default:
            return List;
      }
   };

   return (
      <div className="theme-section space-y-8 py-5">
         {/* Header */}
         <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
               <div className="p-3 bg-[color-mix(in_srgb,var(--utility-color)_10%,transparent)] rounded-full">
                  <Palette className="w-8 h-8 text-[var(--utility-color)]" />
               </div>
               <h2 className="text-3xl font-bold text-[var(--text-color)]">
                  {dict.manage_page.theme_section.title}
               </h2>
            </div>
            <p className="text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] max-w-2xl mx-auto">
               {dict.manage_page.theme_section.subtitle}
            </p>
         </div>

         {/* Alerts */}
         {error && (
            <Alert variant="error" title={error} onClose={() => setError(null)}>
               {error}
            </Alert>
         )}
         {success && (
            <Alert
               variant="success"
               title={success}
               onClose={() => setSuccess(null)}
            >
               {success}
            </Alert>
         )}

         {/* Color Settings Form */}
         <div className="bg-white/80 backdrop-blur-sm border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] rounded-3xl p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div
               className="absolute inset-0 opacity-5"
               style={{
                  backgroundImage: `radial-gradient(var(--utility-color) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
               }}
            ></div>

            <div className="relative">
               <div className="flex items-center gap-3 mb-6">
                  <Paintbrush className="w-6 h-6 text-[var(--utility-color)]" />
                  <div>
                     <h3 className="text-xl font-semibold text-[var(--text-color)]">
                        {dict.manage_page.theme_section.colors_title}
                     </h3>
                     <p className="text-sm text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] mt-1">
                        {dict.manage_page.theme_section.colors_subtitle}
                     </p>
                  </div>
               </div>

               <form onSubmit={handleColorsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {theme && (
                        <>
                           <div>
                              <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                                 {dict.manage_page.theme_section.bg_color}
                              </label>
                              <input
                                 type="color"
                                 name="bg"
                                 defaultValue={theme?.colors.bg || "#ffffff"}
                                 className="w-full h-12 rounded-xl border-2 border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] cursor-pointer"
                              />
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                                 {dict.manage_page.theme_section.text_color}
                              </label>
                              <input
                                 type="color"
                                 name="text"
                                 defaultValue={theme?.colors.text || "#000000"}
                                 className="w-full h-12 rounded-xl border-2 border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] cursor-pointer"
                              />
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                                 {dict.manage_page.theme_section.utility_color}
                              </label>
                              <input
                                 type="color"
                                 name="utility"
                                 defaultValue={
                                    theme?.colors.utility || "#ff4081"
                                 }
                                 className="w-full h-12 rounded-xl border-2 border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] cursor-pointer"
                              />
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                                 {
                                    dict.manage_page.theme_section
                                       .product_card_bg
                                 }
                              </label>
                              <input
                                 type="color"
                                 name="product_card_bg"
                                 defaultValue={
                                    theme?.colors.product_card_bg || "#f5f5f5"
                                 }
                                 className="w-full h-12 rounded-xl border-2 border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] cursor-pointer"
                              />
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                                 {
                                    dict.manage_page.theme_section
                                       .category_card_bg
                                 }
                              </label>
                              <input
                                 type="color"
                                 name="category_card_bg"
                                 defaultValue={
                                    theme?.colors.category_card_bg || "#e0e0e0"
                                 }
                                 className="w-full h-12 rounded-xl border-2 border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] cursor-pointer"
                              />
                           </div>
                        </>
                     )}
                  </div>

                  <Button
                     type="submit"
                     variant="primary"
                     size="lg"
                     icon={Paintbrush}
                     rounded
                     loading={colorsLoading}
                     className="w-full md:w-auto"
                  >
                     {dict.manage_page.theme_section.update_colors}
                  </Button>
               </form>
            </div>
         </div>

         {/* View Style Settings */}
         <div className="bg-white/80 backdrop-blur-sm border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] rounded-3xl p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div
               className="absolute inset-0 opacity-5"
               style={{
                  backgroundImage: `radial-gradient(var(--utility-color) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
               }}
            ></div>

            <div className="relative">
               <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-6 h-6 text-[var(--utility-color)]" />
                  <div>
                     <h3 className="text-xl font-semibold text-[var(--text-color)]">
                        {dict.manage_page.theme_section.view_style_title}
                     </h3>
                     <p className="text-sm text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] mt-1">
                        {dict.manage_page.theme_section.view_style_subtitle}
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["GRID", "LIST", "IMAGE"] as const).map((viewStyle) => {
                     const IconComponent = getViewStyleIcon(viewStyle);
                     const isActive = theme?.view_style === viewStyle;
                     const labels = {
                        GRID: dict.manage_page.theme_section.grid_view,
                        LIST: dict.manage_page.theme_section.list_view,
                        IMAGE: dict.manage_page.theme_section.image_view,
                     };

                     return (
                        <button
                           key={viewStyle}
                           onClick={() => handleViewStyleUpdate(viewStyle)}
                           disabled={viewStyleLoading}
                           className={`p-6 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-1 ${
                              isActive
                                 ? "border-[var(--utility-color)] bg-[color-mix(in_srgb,var(--utility-color)_10%,transparent)] shadow-lg shadow-[var(--utility-color)]/20"
                                 : "border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] hover:border-[var(--utility-color)] hover:shadow-lg hover:shadow-[var(--utility-color)]/10"
                           }`}
                        >
                           <div className="flex flex-col items-center gap-3">
                              <div
                                 className={`p-3 rounded-full ${
                                    isActive
                                       ? "bg-[var(--utility-color)] text-white"
                                       : "bg-[color-mix(in_srgb,var(--bg-color)_85%,var(--utility-color))] text-[var(--utility-color)]"
                                 }`}
                              >
                                 <IconComponent className="w-6 h-6" />
                              </div>
                              <span
                                 className={`font-medium ${
                                    isActive
                                       ? "text-[var(--utility-color)]"
                                       : "text-[var(--text-color)]"
                                 }`}
                              >
                                 {labels[viewStyle]}
                              </span>
                              {isActive && (
                                 <div className="w-2 h-2 bg-[var(--utility-color)] rounded-full animate-pulse"></div>
                              )}
                           </div>
                        </button>
                     );
                  })}
               </div>
            </div>
         </div>

         {/* Current Theme Preview */}
         {theme && (
            <div className="bg-white/80 backdrop-blur-sm border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] rounded-3xl p-8 relative overflow-hidden">
               {/* Background Pattern */}
               <div
                  className="absolute inset-0 opacity-5"
                  style={{
                     backgroundImage: `radial-gradient(var(--utility-color) 1px, transparent 1px)`,
                     backgroundSize: "20px 20px",
                  }}
               ></div>

               <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                     <Eye className="w-6 h-6 text-[var(--utility-color)]" />
                     <h3 className="text-xl font-semibold text-[var(--text-color)]">
                        {dict.manage_page.theme_section.current_theme}
                     </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                     {Object.entries(theme.colors).map(([key, value]) => {
                        const labels = {
                           bg: dict.manage_page.theme_section.bg_color,
                           text: dict.manage_page.theme_section.text_color,
                           product_card_bg:
                              dict.manage_page.theme_section.product_card_bg,
                           category_card_bg:
                              dict.manage_page.theme_section.category_card_bg,
                           utility:
                              dict.manage_page.theme_section.utility_color,
                        };

                        return (
                           <div key={key} className="text-center">
                              <div
                                 className="w-16 h-16 mx-auto mb-2 rounded-2xl border-2 border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] shadow-lg"
                                 style={{ backgroundColor: value }}
                              ></div>
                              <p className="text-xs font-medium text-[var(--text-color)] mb-1">
                                 {labels[key as keyof typeof labels]}
                              </p>
                              <code className="text-xs text-[color-mix(in_srgb,var(--text-color)_60%,transparent)] font-mono">
                                 {value}
                              </code>
                           </div>
                        );
                     })}
                  </div>

                  <div className="mt-6 pt-6 border-t border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))]">
                     <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--text-color)]">
                           {dict.manage_page.theme_section.view_style_title}:
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[color-mix(in_srgb,var(--utility-color)_10%,transparent)] rounded-full border border-[color-mix(in_srgb,var(--utility-color)_20%,transparent)]">
                           {React.createElement(
                              getViewStyleIcon(theme.view_style),
                              {
                                 size: 16,
                                 className: "text-[var(--utility-color)]",
                              }
                           )}
                           <span className="text-sm font-medium text-[var(--utility-color)]">
                              {theme.view_style === "GRID"
                                 ? dict.manage_page.theme_section.grid_view
                                 : theme.view_style === "LIST"
                                 ? dict.manage_page.theme_section.list_view
                                 : dict.manage_page.theme_section.image_view}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default ThemeSection;
