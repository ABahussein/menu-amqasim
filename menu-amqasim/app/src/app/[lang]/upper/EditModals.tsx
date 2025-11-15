"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Edit3, Upload, Image as ImageIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Field from "@/components/Field";

interface DictType {
   upper_section: {
      restaurant_name_placeholder: string;
      restaurant_description_placeholder: string;
      upload_logo: string;
      upload_header_image: string;
      logo_size_limit: string;
      header_image_size_limit: string;
      save_changes: string;
      cancel: string;
   };
}

interface EditModalProps {
   field: string;
   label: string;
   editLabel: string;
   value: string;
   onSave: (field: string, value: string) => Promise<void>;
   loading: boolean;
   dict: DictType;
}

interface ImageEditModalProps extends Omit<EditModalProps, "onSave"> {
   onSave: (field: string, value: string) => Promise<void>;
}

// Text Edit Modal (for name and description)
export function TextEditModal({
   field,
   label,
   editLabel,
   value,
   onSave,
   loading,
   dict,
}: EditModalProps) {
   const [localValue, setLocalValue] = useState(value);
   const [isOpen, setIsOpen] = useState(false);

   const handleSave = async () => {
      await onSave(field, localValue);
      setIsOpen(false);
   };

   const handleOpen = () => {
      setLocalValue(value);
      setIsOpen(true);
   };

   return (
      <Modal
         trigger={
            <button
               className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] text-[var(--utility-color)] hover:bg-[var(--utility-color)] hover:text-white transition-all duration-200 shadow-lg shadow-[var(--utility-color)]/10"
               aria-label={editLabel}
            >
               <Edit3 size={16} />
            </button>
         }
         title={editLabel}
         size="md"
         isOpen={isOpen}
         onOpen={handleOpen}
         onClose={() => setIsOpen(false)}
      >
         <div className="p-6 space-y-4">
            <Field
               label={label}
               type={field === "desc" ? "textarea" : "text"}
               value={localValue}
               onChange={(e) => setLocalValue(e.target.value)}
               placeholder={
                  field === "name"
                     ? dict.upper_section.restaurant_name_placeholder
                     : dict.upper_section.restaurant_description_placeholder
               }
            />

            <div className="flex gap-3 pt-4">
               <Button
                  onClick={handleSave}
                  loading={loading}
                  className="flex-1"
               >
                  {dict.upper_section.save_changes}
               </Button>
               <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
               >
                  {dict.upper_section.cancel}
               </Button>
            </div>
         </div>
      </Modal>
   );
}

// Image Edit Modal (for logo and header_image)
export function ImageEditModal({
   field,
   label,
   editLabel,
   value,
   onSave,
   loading,
   dict,
}: ImageEditModalProps) {
   const [localValue, setLocalValue] = useState(value);
   const [isOpen, setIsOpen] = useState(false);

   const handleSave = async () => {
      await onSave(field, localValue);
      setIsOpen(false);
   };

   const handleOpen = () => {
      setLocalValue(value);
      setIsOpen(true);
   };

   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (e) => {
            const result = e.target?.result as string;
            setLocalValue(result);
         };
         reader.readAsDataURL(file);
      }
   };

   return (
      <Modal
         trigger={
            <button
               className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] text-[var(--utility-color)] hover:bg-[var(--utility-color)] hover:text-white transition-all duration-200 shadow-lg shadow-[var(--utility-color)]/10"
               aria-label={editLabel}
            >
               <Edit3 size={16} />
            </button>
         }
         title={editLabel}
         size="md"
         isOpen={isOpen}
         onOpen={handleOpen}
         onClose={() => setIsOpen(false)}
      >
         <div className="p-6 space-y-4">
            <div className="space-y-4">
               <div className="text-center">
                  {localValue ? (
                     <div className="relative inline-block">
                        <Image
                           src={localValue}
                           alt={`Current ${label}`}
                           width={field === "logo" ? 96 : 320}
                           height={field === "logo" ? 96 : 128}
                           className={`${
                              field === "logo"
                                 ? "w-24 h-24 rounded-full object-cover"
                                 : "w-full max-w-sm h-32 rounded-xl object-cover"
                           } border-2 border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))]`}
                        />
                     </div>
                  ) : (
                     <div
                        className={`${
                           field === "logo"
                              ? "w-24 h-24 rounded-full"
                              : "w-full max-w-sm h-32 rounded-xl"
                        } bg-[color-mix(in_srgb,var(--bg-color)_90%,var(--utility-color))] border-2 border-dashed border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] flex items-center justify-center mx-auto`}
                     >
                        <ImageIcon className="w-8 h-8 text-[color-mix(in_srgb,var(--text-color)_60%,transparent)]" />
                     </div>
                  )}
               </div>

               <div className="relative">
                  <input
                     type="file"
                     accept="image/*"
                     onChange={handleImageChange}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                     id={`image-upload-${field}`}
                  />
                  <Button
                     variant="outline"
                     className="w-full pointer-events-none"
                  >
                     <Upload size={16} />
                     {field === "logo"
                        ? dict.upper_section.upload_logo
                        : dict.upper_section.upload_header_image}
                  </Button>
               </div>

               <p className="text-sm text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] text-center">
                  {field === "logo"
                     ? dict.upper_section.logo_size_limit
                     : dict.upper_section.header_image_size_limit}
               </p>
            </div>

            <div className="flex gap-3 pt-4">
               <Button
                  onClick={handleSave}
                  loading={loading}
                  className="flex-1"
               >
                  {dict.upper_section.save_changes}
               </Button>
               <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
               >
                  {dict.upper_section.cancel}
               </Button>
            </div>
         </div>
      </Modal>
   );
}
