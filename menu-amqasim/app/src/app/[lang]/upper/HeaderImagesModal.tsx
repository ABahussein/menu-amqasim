"use client";

import { useState, useRef, useEffect } from "react";
import {
   Trash2,
   GripVertical,
   Upload,
   Image as ImageIcon,
   Save,
   X,
   Plus,
} from "lucide-react";
import Button from "@/components/Button";
import useUserStore, { UserRole } from "@/store/useUserStore";

interface HeaderImagesModalProps {
   isOpen: boolean;
   onClose: () => void;
   images: string[];
   onSave: (images: string[]) => void;
   loading?: boolean;
   dict: {
      upper_section: {
         manage_header_images: string;
         add_image: string;
         remove_image: string;
         reorder_images: string;
         upload_header_image: string;
         header_image_size_limit: string;
         save_changes: string;
         cancel: string;
         no_images_yet: string;
         drag_to_reorder: string;
         image_uploaded: string;
         max_images_reached: string;
         upload_images: string;
         select_images: string;
         images_count: string;
      };
   };
}

export default function HeaderImagesModal({
   isOpen,
   onClose,
   images,
   onSave,
   loading = false,
   dict,
}: HeaderImagesModalProps) {
   const { role } = useUserStore();
   const [localImages, setLocalImages] = useState<string[]>([]);
   const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const MAX_IMAGES = 10;
   const MAX_SIZE_MB = 4;

   // Check if user has permission to manage header images
   const canManageImages =
      role === UserRole.SUPERADMIN || role === UserRole.ADMIN;

   // Update local images when modal opens or images prop changes
   useEffect(() => {
      if (isOpen) {
         setLocalImages([...images]);
      }
   }, [isOpen, images]);

   // If user doesn't have permission, don't render the modal
   if (!canManageImages) {
      return null;
   }

   // Handle multiple file uploads
   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      // Check if adding these files would exceed the limit
      if (localImages.length + files.length > MAX_IMAGES) {
         alert(dict.upper_section.max_images_reached);
         return;
      }

      const newImages: string[] = [];
      let processedFiles = 0;

      files.forEach((file) => {
         // Check file size
         const fileSizeMB = file.size / (1024 * 1024);
         if (fileSizeMB > MAX_SIZE_MB) {
            alert(
               `${file.name}: ${dict.upper_section.header_image_size_limit}`
            );
            processedFiles++;
            if (processedFiles === files.length && newImages.length > 0) {
               setLocalImages((prev) => [...prev, ...newImages]);
            }
            return;
         }

         const reader = new FileReader();
         reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === "string") {
               newImages.push(result);
               processedFiles++;

               // When all files are processed, update the state
               if (processedFiles === files.length) {
                  setLocalImages((prev) => [...prev, ...newImages]);
               }
            }
         };
         reader.readAsDataURL(file);
      });

      // Reset the input
      event.target.value = "";
   };

   // Remove image
   const removeImage = (index: number) => {
      setLocalImages((prev) => prev.filter((_, i) => i !== index));
   };

   // Drag and drop handlers
   const handleDragStart = (index: number) => {
      setDraggedIndex(index);
   };

   const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
   };

   const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      if (draggedIndex === null || draggedIndex === dropIndex) {
         setDraggedIndex(null);
         return;
      }

      const newImages = [...localImages];
      const draggedItem = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, draggedItem);

      setLocalImages(newImages);
      setDraggedIndex(null);
   };

   const handleDragEnd = () => {
      setDraggedIndex(null);
   };

   // Save changes
   const handleSave = () => {
      onSave(localImages);
   };

   // Reset on close
   const handleClose = () => {
      setDraggedIndex(null);
      onClose();
   };

   // Trigger file input
   const triggerFileInput = () => {
      fileInputRef.current?.click();
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
         <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--text-color)]">
                     {dict.upper_section.manage_header_images}
                  </h2>
                  <button
                     onClick={handleClose}
                     className="text-[var(--text-color)] hover:bg-[var(--utility-color)]/10 rounded-full p-2 transition-colors"
                  >
                     <X className="w-5 h-5" />
                  </button>
               </div>

               {/* Upload section */}
               <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                     {/* Upload button */}
                     <button
                        onClick={triggerFileInput}
                        disabled={localImages.length >= MAX_IMAGES}
                        className="flex-1 flex items-center justify-center h-32 border-2 border-dashed border-[var(--utility-color)]/30 rounded-lg cursor-pointer hover:border-[var(--utility-color)]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <div className="text-center">
                           <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--utility-color)]" />
                           <p className="text-[var(--text-color)] font-medium">
                              {localImages.length > 0
                                 ? dict.upper_section.add_image
                                 : dict.upper_section.select_images}
                           </p>
                           <p className="text-xs text-[var(--text-color)]/60 mt-1">
                              {dict.upper_section.header_image_size_limit}
                           </p>
                           {localImages.length >= MAX_IMAGES && (
                              <p className="text-xs text-red-500 mt-1">
                                 {dict.upper_section.max_images_reached}
                              </p>
                           )}
                        </div>
                     </button>

                     {/* Current count */}
                     <div className="flex items-center justify-center bg-[var(--utility-color)]/10 rounded-lg px-4 py-2 min-w-[120px]">
                        <div className="text-center">
                           <p className="text-2xl font-bold text-[var(--utility-color)]">
                              {localImages.length}
                           </p>
                           <p className="text-xs text-[var(--text-color)]/60">
                              / {MAX_IMAGES} {dict.upper_section.images_count}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Hidden file input */}
                  <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/*"
                     multiple
                     onChange={handleFileUpload}
                     className="hidden"
                  />
               </div>

               {/* Images grid */}
               <div className="space-y-4">
                  {localImages.length === 0 ? (
                     <div className="text-center py-12">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-[var(--text-color)]/40" />
                        <p className="text-[var(--text-color)]/60 mb-4">
                           {dict.upper_section.no_images_yet}
                        </p>
                        <Button onClick={triggerFileInput} className="mx-auto">
                           <Plus className="w-4 h-4 mr-2" />
                           {dict.upper_section.add_image}
                        </Button>
                     </div>
                  ) : (
                     <>
                        <p className="text-sm text-[var(--text-color)]/70 mb-4">
                           {dict.upper_section.drag_to_reorder}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                           {localImages.map((image, index) => (
                              <div
                                 key={index}
                                 className={`relative group bg-white rounded-lg overflow-hidden shadow-md border-2 transition-all cursor-grab active:cursor-grabbing ${
                                    draggedIndex === index
                                       ? "border-[var(--utility-color)] scale-105 shadow-lg"
                                       : "border-transparent hover:border-[var(--utility-color)]/30"
                                 }`}
                                 draggable
                                 onDragStart={() => handleDragStart(index)}
                                 onDragOver={handleDragOver}
                                 onDrop={(e) => handleDrop(e, index)}
                                 onDragEnd={handleDragEnd}
                              >
                                 {/* Drag handle */}
                                 <div className="absolute top-2 left-2 z-10 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="w-4 h-4 text-white" />
                                 </div>

                                 {/* Remove button */}
                                 <button
                                    onClick={(e) => {
                                       e.preventDefault();
                                       e.stopPropagation();
                                       removeImage(index);
                                    }}
                                    className="absolute top-2 right-2 z-20 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 transform hover:scale-110"
                                    title={dict.upper_section.remove_image}
                                 >
                                    <Trash2 className="w-3 h-3" />
                                 </button>

                                 {/* Image */}
                                 <div className="aspect-video">
                                    <div
                                       className="w-full h-full bg-cover bg-center"
                                       style={{
                                          backgroundImage: `url(${image})`,
                                       }}
                                    />
                                 </div>

                                 {/* Image index */}
                                 <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    {index + 1}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </>
                  )}
               </div>

               {/* Action buttons */}
               <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--utility-color)]/20">
                  <Button
                     variant="outline"
                     onClick={handleClose}
                     disabled={loading}
                  >
                     {dict.upper_section.cancel}
                  </Button>

                  <Button
                     onClick={handleSave}
                     loading={loading}
                     className="flex items-center gap-2"
                  >
                     <Save className="w-4 h-4" />
                     {dict.upper_section.save_changes}
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
}
