"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Edit3, Trash2, Upload } from "lucide-react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Field from "@/components/Field";
import Alert from "@/components/Alert";
import useUserStore from "@/store/useUserStore";
import useLangStore from "@/store/useLangStore";
import call from "@/utils/call";

interface Category {
   _id: string;
   name: string;
   description?: string;
   image?: string;
   lang_abbr: "en" | "ar";
   createdAt: string;
   updatedAt: string;
}

interface DictType {
   categories: {
      add_category: string;
      edit_category: string;
      delete_category: string;
      category_name: string;
      category_description: string;
      category_image: string;
      name_placeholder: string;
      description_placeholder: string;
      upload_image: string;
      image_size_limit: string;
      save_changes: string;
      create_category: string;
      cancel: string;
      delete_confirmation: string;
      delete_warning: string;
      confirm_delete: string;
      name_required: string;
      image_size_error: string;
      created_success: string;
      create_failed: string;
      updated_success: string;
      update_failed: string;
      deleted_success: string;
      delete_failed: string;
   };
}

interface CategoryModalsProps {
   dict: DictType;
   onRefresh: () => void;
   trigger?: React.ReactNode;
}

// Create Category Modal
export function CreateCategoryModal({
   dict,
   onRefresh,
   trigger,
}: CategoryModalsProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [loading, setLoading] = useState(false);
   const [name, setName] = useState("");
   const [description, setDescription] = useState("");
   const [image, setImage] = useState<string>("");
   const [alert, setAlert] = useState<{
      message: string;
      type: "success" | "error";
   } | null>(null);
   const { token } = useUserStore();
   const { lang } = useLangStore();

   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (1MB limit)
      if (file.size > 1024 * 1024) {
         setAlert({
            message: dict.categories.image_size_error,
            type: "error",
         });
         return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
         setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
   };

   const handleSave = async () => {
      if (!name.trim()) {
         setAlert({ message: dict.categories.name_required, type: "error" });
         return;
      }

      setLoading(true);
      setAlert(null);

      try {
         const response = await call({
            url: "/apis/category",
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               name: name,
               description: description.trim() || undefined,
               image: image || undefined,
               lang_abbr: lang,
            }),
         });

         if (response.isOk) {
            setAlert({
               message: dict.categories.created_success,
               type: "success",
            });
            setTimeout(() => {
               setIsOpen(false);
               onRefresh();
               // Reset form
               setName("");
               setDescription("");
               setImage("");
               setAlert(null);
            }, 1500);
         } else {
            setAlert({
               message: response.msg || dict.categories.create_failed,
               type: "error",
            });
         }
      } catch (error) {
         console.error("Error creating category:", error);
         setAlert({ message: dict.categories.create_failed, type: "error" });
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal
         trigger={
            trigger || (
               <button
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--utility-color)] text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg"
                  aria-label={dict.categories.add_category}
               >
                  <Plus size={16} />
                  {dict.categories.add_category}
               </button>
            )
         }
         title={dict.categories.add_category}
         size="md"
         isOpen={isOpen}
         onOpen={() => setIsOpen(true)}
         onClose={() => {
            setIsOpen(false);
            setAlert(null);
         }}
      >
         <div className="p-6 space-y-4">
            {alert && <Alert variant={alert.type}>{alert.message}</Alert>}

            <Field
               label={dict.categories.category_name}
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder={dict.categories.name_placeholder}
               required
               onKeyDown={(e) => {
                  // Ensure spaces are allowed
                  if (e.key === " ") {
                     e.stopPropagation();
                  }
               }}
            />

            <Field
               label={dict.categories.category_description}
               type="textarea"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder={dict.categories.description_placeholder}
            />

            <div>
               <label className="block text-sm font-medium mb-2">
                  {dict.categories.category_image}
               </label>
               <div className="space-y-2">
                  <input
                     type="file"
                     accept="image/*"
                     onChange={handleImageUpload}
                     className="hidden"
                     id="create-image-upload"
                  />
                  <label
                     htmlFor="create-image-upload"
                     className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[var(--utility-color)] rounded-lg cursor-pointer hover:bg-[var(--bg-color)] transition-colors"
                  >
                     <Upload size={16} />
                     {dict.categories.upload_image}
                  </label>
                  <p className="text-xs text-gray-500">
                     {dict.categories.image_size_limit}
                  </p>
                  {image && (
                     <div className="mt-2">
                        <Image
                           src={image}
                           alt="Preview"
                           width={100}
                           height={100}
                           className="rounded-lg object-cover"
                        />
                     </div>
                  )}
               </div>
            </div>

            <div className="flex gap-3 pt-4">
               <Button
                  onClick={handleSave}
                  loading={loading}
                  className="flex-1"
               >
                  {dict.categories.create_category}
               </Button>
               <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
               >
                  {dict.categories.cancel}
               </Button>
            </div>
         </div>
      </Modal>
   );
}

// Edit Category Modal
export function EditCategoryModal({
   category,
   dict,
   onRefresh,
}: {
   category: Category;
   dict: DictType;
   onRefresh: () => void;
}) {
   const [isOpen, setIsOpen] = useState(false);
   const [loading, setLoading] = useState(false);
   const [name, setName] = useState(category.name);
   const [description, setDescription] = useState(category.description || "");
   const [image, setImage] = useState(category.image || "");
   const [alert, setAlert] = useState<{
      message: string;
      type: "success" | "error";
   } | null>(null);
   const { token } = useUserStore();
   const { lang } = useLangStore();

   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (1MB limit)
      if (file.size > 1024 * 1024) {
         setAlert({
            message: dict.categories.image_size_error,
            type: "error",
         });
         return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
         setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
   };

   const handleOpen = () => {
      setName(category.name);
      setDescription(category.description || "");
      setImage(category.image || "");
      setAlert(null);
      setIsOpen(true);
   };

   const handleSave = async () => {
      if (!name.trim()) {
         setAlert({ message: dict.categories.name_required, type: "error" });
         return;
      }

      setLoading(true);
      setAlert(null);

      try {
         const response = await call({
            url: "/apis/category",
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               current_name: category.name,
               name: name,
               description: description.trim() || undefined,
               image: image || undefined,
               lang_abbr: lang,
            }),
         });

         if (response.isOk) {
            setAlert({
               message: dict.categories.updated_success,
               type: "success",
            });
            setTimeout(() => {
               setIsOpen(false);
               onRefresh();
               setAlert(null);
            }, 1500);
         } else {
            setAlert({
               message: response.msg || dict.categories.update_failed,
               type: "error",
            });
         }
      } catch (error) {
         console.error("Error updating category:", error);
         setAlert({ message: dict.categories.update_failed, type: "error" });
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal
         trigger={
            <button
               className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] text-[var(--utility-color)] hover:bg-[var(--utility-color)] hover:text-white transition-all duration-200 shadow-lg shadow-[var(--utility-color)]/10"
               aria-label={dict.categories.edit_category}
            >
               <Edit3 size={14} />
            </button>
         }
         title={dict.categories.edit_category}
         size="md"
         isOpen={isOpen}
         onOpen={handleOpen}
         onClose={() => {
            setIsOpen(false);
            setAlert(null);
         }}
      >
         <div className="p-6 space-y-4">
            {alert && <Alert variant={alert.type}>{alert.message}</Alert>}

            <Field
               label={dict.categories.category_name}
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder={dict.categories.name_placeholder}
               required
               onKeyDown={(e) => {
                  // Ensure spaces are allowed
                  if (e.key === " ") {
                     e.stopPropagation();
                  }
               }}
            />

            <Field
               label={dict.categories.category_description}
               type="textarea"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder={dict.categories.description_placeholder}
            />

            <div>
               <label className="block text-sm font-medium mb-2">
                  {dict.categories.category_image}
               </label>
               <div className="space-y-2">
                  <input
                     type="file"
                     accept="image/*"
                     onChange={handleImageUpload}
                     className="hidden"
                     id={`edit-image-upload-${category._id}`}
                  />
                  <label
                     htmlFor={`edit-image-upload-${category._id}`}
                     className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[var(--utility-color)] rounded-lg cursor-pointer hover:bg-[var(--bg-color)] transition-colors"
                  >
                     <Upload size={16} />
                     {dict.categories.upload_image}
                  </label>
                  <p className="text-xs text-gray-500">
                     {dict.categories.image_size_limit}
                  </p>
                  {image && (
                     <div className="mt-2">
                        <Image
                           src={image}
                           alt="Preview"
                           width={100}
                           height={100}
                           className="rounded-lg object-cover"
                        />
                     </div>
                  )}
               </div>
            </div>

            <div className="flex gap-3 pt-4">
               <Button
                  onClick={handleSave}
                  loading={loading}
                  className="flex-1"
               >
                  {dict.categories.save_changes}
               </Button>
               <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
               >
                  {dict.categories.cancel}
               </Button>
            </div>
         </div>
      </Modal>
   );
}

// Delete Category Modal
export function DeleteCategoryModal({
   category,
   dict,
   onRefresh,
}: {
   category: Category;
   dict: DictType;
   onRefresh: () => void;
}) {
   const [isOpen, setIsOpen] = useState(false);
   const [loading, setLoading] = useState(false);
   const [alert, setAlert] = useState<{
      message: string;
      type: "success" | "error";
   } | null>(null);
   const { token } = useUserStore();
   const { lang } = useLangStore();

   const handleDelete = async () => {
      setLoading(true);
      setAlert(null);

      try {
         const response = await call({
            url: "/apis/category",
            method: "DELETE",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               name: category.name,
               lang_abbr: lang,
            }),
         });

         if (response.isOk) {
            setAlert({
               message: dict.categories.deleted_success,
               type: "success",
            });
            setTimeout(() => {
               setIsOpen(false);
               onRefresh();
               setAlert(null);
            }, 1500);
         } else {
            setAlert({
               message: response.msg || dict.categories.delete_failed,
               type: "error",
            });
         }
      } catch (error) {
         console.error("Error deleting category:", error);
         setAlert({ message: dict.categories.delete_failed, type: "error" });
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal
         trigger={
            <button
               className="absolute top-2 left-2 p-2 bg-white/90 backdrop-blur-sm rounded-full border border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-lg shadow-red-600/10"
               aria-label={dict.categories.delete_category}
            >
               <Trash2 size={14} />
            </button>
         }
         title={dict.categories.delete_category}
         size="sm"
         isOpen={isOpen}
         onOpen={() => setIsOpen(true)}
         onClose={() => {
            setIsOpen(false);
            setAlert(null);
         }}
      >
         <div className="p-6 space-y-4">
            {alert && <Alert variant={alert.type}>{alert.message}</Alert>}

            <div className="text-center">
               <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {dict.categories.delete_confirmation}
               </h3>
               <p className="text-gray-600 mb-4">
                  {dict.categories.delete_warning.replace(
                     "{name}",
                     category.name
                  )}
               </p>
            </div>

            <div className="flex gap-3 pt-4">
               <Button
                  onClick={handleDelete}
                  loading={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
               >
                  {dict.categories.confirm_delete}
               </Button>
               <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
               >
                  {dict.categories.cancel}
               </Button>
            </div>
         </div>
      </Modal>
   );
}
