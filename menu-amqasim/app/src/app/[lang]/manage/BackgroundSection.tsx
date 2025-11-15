"use client";

import { getDictionary } from "@/dictionaries/dictionaries";
import useUserStore from "@/store/useUserStore";
import call from "@/utils/call";
import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import Modal from "@/components/Modal";

import { ImageIcon, Upload, Trash2, AlertTriangle } from "lucide-react";

interface Content {
   _id: string;
   name?: string;
   desc?: string;
   logo?: string;
   header_image?: string;
   bg_image?: string;
   info_bar?: Record<string, unknown>;
   lang_abbr: "en" | "ar";
   createdAt: string;
   updatedAt: string;
}

function BackgroundSection({ lang }: { lang: string }) {
   const dict = getDictionary(lang as "ar" | "en");
   const [content, setContent] = useState<Content | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const [removing, setRemoving] = useState(false);
   const [previewImage, setPreviewImage] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const { token } = useUserStore((state) => state);

   // Fetch current content from API
   useEffect(() => {
      async function fetchContent() {
         try {
            const { isOk, data, msg } = await call({
               url: `/apis/content?lang_abbr=${lang}`,
               method: "GET",
            });

            if (!isOk) {
               setError(msg);
            }

            if (data) {
               setContent(data.content);
               setError(null);
            }
         } catch (error) {
            console.error("Error fetching content:", error);
            setError(dict.manage_page.background_section.error_updating);
         }
      }
      fetchContent();
   }, [dict.manage_page.background_section.error_updating, lang]);

   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
         setError(dict.manage_page.background_section.invalid_format);
         return;
      }

      // Validate file size (4MB)
      const maxSize = 4 * 1024 * 1024; // 4MB in bytes
      if (file.size > maxSize) {
         setError(dict.manage_page.background_section.image_too_large);
         return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
         const base64String = event.target?.result as string;
         setPreviewImage(base64String);
         setError(null);
      };
      reader.readAsDataURL(file);
   };

   const handleUpload = async () => {
      if (!previewImage) return;

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
         const { isOk, data, msg } = await call({
            url: "/apis/content",
            method: "PUT",
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               bg_image: previewImage,
               lang_abbr: lang,
            }),
         });

         if (!isOk) {
            setError(msg);
         } else if (data) {
            setSuccess(dict.manage_page.background_section.background_updated);
            setContent(data.content);
            setPreviewImage(null);
            if (fileInputRef.current) {
               fileInputRef.current.value = "";
            }
            // Reload page to apply background changes
            setTimeout(() => {
               window.location.reload();
            }, 1000);
         }
      } catch (error) {
         console.error("Error updating background:", error);
         setError(dict.manage_page.background_section.error_updating);
      } finally {
         setLoading(false);
      }
   };

   const handleRemoveBackground = async () => {
      setRemoving(true);
      setError(null);
      setSuccess(null);

      try {
         const { isOk, data, msg } = await call({
            url: "/apis/content",
            method: "PUT",
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               bg_image: null,
               lang_abbr: lang,
            }),
         });

         if (!isOk) {
            setError(msg);
         } else if (data) {
            setSuccess(dict.manage_page.background_section.background_removed);
            setContent(data.content);
            // Reload page to apply background changes
            setTimeout(() => {
               window.location.reload();
            }, 1000);
         }
      } catch (error) {
         console.error("Error removing background:", error);
         setError(dict.manage_page.background_section.error_removing);
      } finally {
         setRemoving(false);
      }
   };

   const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
   };

   const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
         const file = files[0];

         // Validate file type
         const validTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
         ];
         if (!validTypes.includes(file.type)) {
            setError(dict.manage_page.background_section.invalid_format);
            return;
         }

         // Validate file size (4MB)
         const maxSize = 4 * 1024 * 1024;
         if (file.size > maxSize) {
            setError(dict.manage_page.background_section.image_too_large);
            return;
         }

         // Convert to base64
         const reader = new FileReader();
         reader.onload = (event) => {
            const base64String = event.target?.result as string;
            setPreviewImage(base64String);
            setError(null);
         };
         reader.readAsDataURL(file);
      }
   };

   const cancelPreview = () => {
      setPreviewImage(null);
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
   };

   return (
      <div className="background-section space-y-8 py-5">
         {/* Header */}
         <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
               <div className="p-3 bg-[color-mix(in_srgb,var(--utility-color)_10%,transparent)] rounded-full">
                  <ImageIcon className="w-8 h-8 text-[var(--utility-color)]" />
               </div>
               <h2 className="text-3xl font-bold text-[var(--text-color)]">
                  {dict.manage_page.background_section.title}
               </h2>
            </div>
            <p className="text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] max-w-2xl mx-auto">
               {dict.manage_page.background_section.subtitle}
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

         {/* Background Management */}
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
                  <Upload className="w-6 h-6 text-[var(--utility-color)]" />
                  <div>
                     <h3 className="text-xl font-semibold text-[var(--text-color)]">
                        {dict.manage_page.background_section.background_image}
                     </h3>
                     <p className="text-sm text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] mt-1">
                        {dict.manage_page.background_section.image_size_limit} •{" "}
                        {dict.manage_page.background_section.supported_formats}
                     </p>
                  </div>
               </div>

               {/* Current Background or Upload Area */}
               {previewImage || content?.bg_image ? (
                  <div className="space-y-4">
                     <div className="relative rounded-2xl overflow-hidden border-2 border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                           src={previewImage || content?.bg_image || ""}
                           alt="Background"
                           className="w-full h-64 object-cover"
                        />
                        {previewImage && (
                           <div className="absolute top-4 right-4">
                              <span className="px-3 py-1 bg-[var(--utility-color)] text-white text-sm font-medium rounded-full">
                                 {dict.manage_page.background_section.preview}
                              </span>
                           </div>
                        )}
                     </div>

                     <div className="flex gap-3">
                        {previewImage ? (
                           <>
                              <Button
                                 variant="secondary"
                                 size="lg"
                                 onClick={cancelPreview}
                                 className="flex-1"
                              >
                                 {dict.manage_page.background_section.cancel}
                              </Button>
                              <Button
                                 variant="primary"
                                 size="lg"
                                 onClick={handleUpload}
                                 loading={loading}
                                 className="flex-1"
                              >
                                 {
                                    dict.manage_page.background_section
                                       .save_changes
                                 }
                              </Button>
                           </>
                        ) : (
                           <>
                              <Button
                                 variant="secondary"
                                 size="lg"
                                 icon={Upload}
                                 onClick={() => fileInputRef.current?.click()}
                                 className="flex-1"
                              >
                                 {
                                    dict.manage_page.background_section
                                       .change_background
                                 }
                              </Button>

                              <Modal
                                 title={
                                    dict.manage_page.background_section
                                       .confirm_remove
                                 }
                                 trigger={
                                    <Button
                                       variant="danger"
                                       size="lg"
                                       icon={Trash2}
                                       loading={removing}
                                    >
                                       {
                                          dict.manage_page.background_section
                                             .remove_background
                                       }
                                    </Button>
                                 }
                              >
                                 <div className="text-center py-4">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                       <div className="p-3 bg-red-50 rounded-full">
                                          <AlertTriangle className="w-6 h-6 text-red-500" />
                                       </div>
                                    </div>
                                    <p className="text-[var(--text-color)] leading-relaxed mb-6">
                                       {
                                          dict.manage_page.background_section
                                             .remove_warning
                                       }
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                       <Button variant="secondary" size="lg">
                                          {
                                             dict.manage_page.background_section
                                                .cancel
                                          }
                                       </Button>
                                       <Button
                                          variant="danger"
                                          size="lg"
                                          onClick={handleRemoveBackground}
                                          loading={removing}
                                       >
                                          {
                                             dict.manage_page.background_section
                                                .confirm_remove_button
                                          }
                                       </Button>
                                    </div>
                                 </div>
                              </Modal>
                           </>
                        )}
                     </div>
                  </div>
               ) : (
                  <div
                     className="border-2 border-dashed border-[color-mix(in_srgb,var(--utility-color)_30%,transparent)] rounded-2xl p-12 text-center hover:border-[var(--utility-color)] transition-colors cursor-pointer"
                     onDragOver={handleDragOver}
                     onDrop={handleDrop}
                     onClick={() => fileInputRef.current?.click()}
                  >
                     <Upload className="w-12 h-12 text-[color-mix(in_srgb,var(--utility-color)_60%,transparent)] mx-auto mb-4" />
                     <p className="text-[var(--text-color)] font-medium mb-2">
                        {dict.manage_page.background_section.drag_drop}
                     </p>
                     <p className="text-sm text-[color-mix(in_srgb,var(--text-color)_60%,transparent)]">
                        {dict.manage_page.background_section.supported_formats}
                     </p>
                  </div>
               )}

               {/* File Input */}
               <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
               />
            </div>
         </div>
      </div>
   );
}

export default BackgroundSection;
