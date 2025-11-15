"use client";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Upload, X } from "lucide-react";
import Modal from "@/components/Modal";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import call from "@/utils/call";
import useUserStore from "@/store/useUserStore";
import useLangStore from "@/store/useLangStore";
import { ALLERGIES_AR, ALLERGIES_EN } from "@/models/content";
import type { IAddon } from "@/models/product";
import Image from "next/image";

interface Product {
   _id: string;
   name: string;
   price: number;
   totalPrice?: number;
   description?: string;
   category: string;
   calories?: number;
   image?: string;
   allergies?: string[];
   addons?: IAddon[];
   createdAt: string;
   updatedAt: string;
}

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
   products: {
      add_product: string;
      edit_product: string;
      delete_product: string;
      product_name: string;
      product_price: string;
      product_description: string;
      product_category: string;
      product_calories: string;
      product_image: string;
      product_allergies: string;
      product_addons: string;
      addon_name: string;
      addon_price: string;
      add_addon: string;
      remove_addon: string;
      addon_name_placeholder: string;
      addon_price_placeholder: string;
      base_price: string;
      total_price: string;
      with_addons: string;
      no_addons: string;
      addon_name_required: string;
      addon_price_required: string;
      addon_price_invalid: string;
      name_placeholder: string;
      price_placeholder: string;
      description_placeholder: string;
      category_placeholder: string;
      calories_placeholder: string;
      upload_image: string;
      image_size_limit: string;
      save_changes: string;
      create_product: string;
      cancel: string;
      delete_confirmation: string;
      delete_warning: string;
      confirm_delete: string;
      name_required: string;
      price_required: string;
      category_required: string;
      price_invalid: string;
      image_size_error: string;
      created_success: string;
      create_failed: string;
      updated_success: string;
      update_failed: string;
      deleted_success: string;
      delete_failed: string;
      currency_symbol: string;
      calories_unit: string;
      select_allergies: string;
      no_allergies: string;
      allergies_selected: string;
      available_addons: string;
      select_addons: string;
      addon_selected: string;
      customize_your_order: string;
      updated_total: string;
   };
   info_bar: {
      allergy_descriptions: Record<string, string>;
   };
}

interface ProductModalsProps {
   dict: DictType;
   onRefresh: () => void;
   trigger?: React.ReactNode;
}

// Create Product Modal
export function CreateProductModal({
   dict,
   onRefresh,
   trigger,
}: ProductModalsProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [loading, setLoading] = useState(false);
   const [name, setName] = useState("");
   const [price, setPrice] = useState("");
   const [description, setDescription] = useState("");
   const [category, setCategory] = useState("");
   const [calories, setCalories] = useState("");
   const [image, setImage] = useState<string>("");
   const [allergies, setAllergies] = useState<string[]>([]);
   const [addons, setAddons] = useState<IAddon[]>([]);
   const [categories, setCategories] = useState<Category[]>([]);
   const [alert, setAlert] = useState<{
      message: string;
      type: "success" | "error";
   } | null>(null);
   const { token } = useUserStore();
   const { lang } = useLangStore();

   const availableAllergies = lang === "ar" ? ALLERGIES_AR : ALLERGIES_EN;

   useEffect(() => {
      const fetchCategories = async () => {
         try {
            const response = await call({
               url: `/apis/category?lang_abbr=${lang}`,
               method: "GET",
            });
            if (response.isOk && response.data?.categories) {
               setCategories(response.data.categories);
            }
         } catch (error) {
            console.error("Error fetching categories:", error);
         }
      };

      if (isOpen) {
         fetchCategories();
      }
   }, [isOpen, lang]);

   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (1MB limit)
      if (file.size > 1024 * 1024) {
         setAlert({
            message: dict.products.image_size_error,
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

   const handleAllergyToggle = (allergy: string) => {
      setAllergies((prev) =>
         prev.includes(allergy)
            ? prev.filter((a) => a !== allergy)
            : [...prev, allergy]
      );
   };

   const addAddon = () => {
      setAddons((prev) => [...prev, { name: "", price: 0 }]);
   };

   const removeAddon = (index: number) => {
      setAddons((prev) => prev.filter((_, i) => i !== index));
   };

   const updateAddon = (
      index: number,
      field: keyof IAddon,
      value: string | number
   ) => {
      setAddons((prev) => {
         const updated = [...prev];
         updated[index] = { ...updated[index], [field]: value };
         return updated;
      });
   };

   const validateAddons = (): boolean => {
      for (let i = 0; i < addons.length; i++) {
         const addon = addons[i];
         if (!addon.name.trim()) {
            setAlert({
               message: dict.products.addon_name_required,
               type: "error",
            });
            return false;
         }
         if (addon.price < 0) {
            setAlert({
               message: dict.products.addon_price_invalid,
               type: "error",
            });
            return false;
         }
      }
      return true;
   };

   const handleSave = async () => {
      if (!name.trim()) {
         setAlert({ message: dict.products.name_required, type: "error" });
         return;
      }

      if (!price.trim()) {
         setAlert({ message: dict.products.price_required, type: "error" });
         return;
      }

      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
         setAlert({ message: dict.products.price_invalid, type: "error" });
         return;
      }

      if (!category) {
         setAlert({ message: dict.products.category_required, type: "error" });
         return;
      }

      if (!validateAddons()) {
         return;
      }

      setLoading(true);
      setAlert(null);

      try {
         const response = await call({
            url: "/apis/product",
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               name: name.trim(),
               price: priceNum,
               description: description.trim() || undefined,
               category,
               calories: calories.trim() ? parseInt(calories) : undefined,
               image: image || undefined,
               allergies: allergies.length > 0 ? allergies : undefined,
               addons:
                  addons.length > 0
                     ? addons.filter((addon) => addon.name.trim())
                     : undefined,
            }),
         });

         if (response.isOk) {
            setAlert({
               message: dict.products.created_success,
               type: "success",
            });
            // Reset form
            setName("");
            setPrice("");
            setDescription("");
            setCategory("");
            setCalories("");
            setImage("");
            setAllergies([]);
            setAddons([]);
            onRefresh();
            setTimeout(() => setIsOpen(false), 1500);
         } else {
            setAlert({ message: dict.products.create_failed, type: "error" });
         }
      } catch (error) {
         console.error("Error creating product:", error);
         setAlert({ message: dict.products.create_failed, type: "error" });
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
                  aria-label={dict.products.add_product}
               >
                  <Plus size={16} />
                  {dict.products.add_product}
               </button>
            )
         }
         title={dict.products.add_product}
         size="lg"
         isOpen={isOpen}
         onOpen={() => setIsOpen(true)}
         onClose={() => {
            setIsOpen(false);
            setAlert(null);
         }}
      >
         <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {alert && <Alert variant={alert.type}>{alert.message}</Alert>}

            <Field
               label={dict.products.product_name}
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder={dict.products.name_placeholder}
               required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Field
                  label={dict.products.product_price}
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={dict.products.price_placeholder}
                  required
                  min="0"
                  step="0.01"
               />

               <Field
                  label={dict.products.product_calories}
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder={dict.products.calories_placeholder}
                  min="0"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {dict.products.product_category} *
               </label>
               <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--utility-color)] focus:border-transparent"
               >
                  <option value="">{dict.products.category_placeholder}</option>
                  {categories.map((cat) => (
                     <option key={cat._id} value={cat.name}>
                        {cat.name}
                     </option>
                  ))}
               </select>
            </div>

            <Field
               label={dict.products.product_description}
               type="textarea"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder={dict.products.description_placeholder}
            />

            {/* Image Upload */}
            <div>
               <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {dict.products.product_image}
               </label>
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="product-image-upload"
                     />
                     <label
                        htmlFor="product-image-upload"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                     >
                        <Upload size={16} />
                        {dict.products.upload_image}
                     </label>
                     {image && (
                        <button
                           onClick={() => setImage("")}
                           className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                           type="button"
                        >
                           <X size={16} />
                        </button>
                     )}
                  </div>
                  <p className="text-xs text-gray-500">
                     {dict.products.image_size_limit}
                  </p>
                  {image && (
                     <div className="mt-2">
                        <Image
                           src={image}
                           alt="Product preview"
                           width={128}
                           height={128}
                           className="w-32 h-32 object-cover rounded-lg border"
                        />
                     </div>
                  )}
               </div>
            </div>

            {/* Allergies Selection */}
            <div>
               <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {dict.products.product_allergies}
               </label>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(availableAllergies).map(([key, value]) => (
                     <label
                        key={key}
                        className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                     >
                        <input
                           type="checkbox"
                           checked={allergies.includes(value)}
                           onChange={() => handleAllergyToggle(value)}
                           className="rounded border-gray-300 text-[var(--utility-color)] focus:ring-[var(--utility-color)]"
                        />
                        <span className="text-sm">
                           {dict.info_bar.allergy_descriptions[value] || value}
                        </span>
                     </label>
                  ))}
               </div>
               {allergies.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                     {allergies.length} {dict.products.allergies_selected}
                  </p>
               )}
            </div>

            {/* Addons Section */}
            <div>
               <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[var(--text-color)]">
                     {dict.products.product_addons}
                  </label>
                  <button
                     type="button"
                     onClick={addAddon}
                     className="flex items-center gap-1 px-3 py-1 text-sm bg-[var(--utility-color)] text-white rounded-lg hover:opacity-90 transition-all"
                  >
                     <Plus size={14} />
                     {dict.products.add_addon}
                  </button>
               </div>

               {addons.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                     {dict.products.no_addons}
                  </p>
               ) : (
                  <div className="space-y-2">
                     {addons.map((addon, index) => (
                        <div
                           key={index}
                           className="flex gap-2 items-start p-3 border rounded-lg"
                        >
                           <div className="flex-1">
                              <Field
                                 label={dict.products.addon_name}
                                 type="text"
                                 value={addon.name}
                                 onChange={(e) =>
                                    updateAddon(index, "name", e.target.value)
                                 }
                                 placeholder={
                                    dict.products.addon_name_placeholder
                                 }
                              />
                           </div>
                           <div className="w-20">
                              <Field
                                 label={dict.products.addon_price}
                                 type="number"
                                 value={addon.price.toString()}
                                 onChange={(e) =>
                                    updateAddon(
                                       index,
                                       "price",
                                       parseFloat(e.target.value) || 0
                                    )
                                 }
                                 placeholder={
                                    dict.products.addon_price_placeholder
                                 }
                                 min="0"
                                 step="0.01"
                              />
                           </div>
                           <button
                              type="button"
                              onClick={() => removeAddon(index)}
                              className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label={dict.products.remove_addon}
                           >
                              <X size={16} />
                           </button>
                        </div>
                     ))}
                  </div>
               )}

               {/* Price Summary */}
               {(price || addons.length > 0) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                     <div className="flex justify-between text-sm font-semibold">
                        <span>{dict.products.base_price}:</span>
                        <span>
                           {dict.products.currency_symbol}
                           {parseFloat(price) || 0}
                        </span>
                     </div>
                     {addons.length > 0 && (
                        <>
                           <div className="mt-2 pt-2 border-t">
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                 {dict.products.available_addons}:
                              </div>
                              {addons.map(
                                 (addon, index) =>
                                    addon.name && (
                                       <div
                                          key={index}
                                          className="flex justify-between text-sm text-gray-600"
                                       >
                                          <span>• {addon.name}</span>
                                          <span>
                                             +{dict.products.currency_symbol}
                                             {addon.price}
                                          </span>
                                       </div>
                                    )
                              )}
                           </div>
                        </>
                     )}
                  </div>
               )}
            </div>

            <div className="flex gap-3 pt-4">
               <Button
                  onClick={handleSave}
                  loading={loading}
                  className="flex-1"
               >
                  {dict.products.create_product}
               </Button>
               <Button
                  onClick={() => setIsOpen(false)}
                  variant="secondary"
                  className="flex-1"
               >
                  {dict.products.cancel}
               </Button>
            </div>
         </div>
      </Modal>
   );
}

// Edit Product Modal
export function EditProductModal({
   product,
   dict,
   onRefresh,
}: {
   product: Product;
   dict: DictType;
   onRefresh: () => void;
}) {
   const [isOpen, setIsOpen] = useState(false);
   const [loading, setLoading] = useState(false);
   const [name, setName] = useState(product.name);
   const [price, setPrice] = useState(product.price.toString());
   const [description, setDescription] = useState(product.description || "");
   const [category, setCategory] = useState(product.category);
   const [calories, setCalories] = useState(product.calories?.toString() || "");
   const [image, setImage] = useState(product.image || "");
   const [allergies, setAllergies] = useState<string[]>(
      product.allergies || []
   );
   const [addons, setAddons] = useState<IAddon[]>(product.addons || []);
   const [categories, setCategories] = useState<Category[]>([]);
   const [alert, setAlert] = useState<{
      message: string;
      type: "success" | "error";
   } | null>(null);
   const { token } = useUserStore();
   const { lang } = useLangStore();

   const availableAllergies = lang === "ar" ? ALLERGIES_AR : ALLERGIES_EN;

   const fetchCategories = async () => {
      try {
         const response = await call({
            url: `/apis/category?lang_abbr=${lang}`,
            method: "GET",
         });
         if (response.isOk && response.data?.categories) {
            setCategories(response.data.categories);
         }
      } catch (error) {
         console.error("Error fetching categories:", error);
      }
   };

   const handleOpen = () => {
      setName(product.name);
      setPrice(product.price.toString());
      setDescription(product.description || "");
      setCategory(product.category);
      setCalories(product.calories?.toString() || "");
      setImage(product.image || "");
      setAllergies(product.allergies || []);
      setAddons(product.addons || []);
      setAlert(null);
      setIsOpen(true);
      fetchCategories();
   };

   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 1024 * 1024) {
         setAlert({
            message: dict.products.image_size_error,
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

   const handleAllergyToggle = (allergy: string) => {
      setAllergies((prev) =>
         prev.includes(allergy)
            ? prev.filter((a) => a !== allergy)
            : [...prev, allergy]
      );
   };

   const addAddon = () => {
      setAddons((prev) => [...prev, { name: "", price: 0 }]);
   };

   const removeAddon = (index: number) => {
      setAddons((prev) => prev.filter((_, i) => i !== index));
   };

   const updateAddon = (
      index: number,
      field: keyof IAddon,
      value: string | number
   ) => {
      setAddons((prev) => {
         const updated = [...prev];
         updated[index] = { ...updated[index], [field]: value };
         return updated;
      });
   };

   const validateAddons = (): boolean => {
      for (let i = 0; i < addons.length; i++) {
         const addon = addons[i];
         if (!addon.name.trim()) {
            setAlert({
               message: dict.products.addon_name_required,
               type: "error",
            });
            return false;
         }
         if (addon.price < 0) {
            setAlert({
               message: dict.products.addon_price_invalid,
               type: "error",
            });
            return false;
         }
      }
      return true;
   };

   const handleSave = async () => {
      if (!name.trim()) {
         setAlert({ message: dict.products.name_required, type: "error" });
         return;
      }

      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
         setAlert({ message: dict.products.price_invalid, type: "error" });
         return;
      }

      if (!category) {
         setAlert({ message: dict.products.category_required, type: "error" });
         return;
      }

      if (!validateAddons()) {
         return;
      }

      setLoading(true);
      setAlert(null);

      try {
         const response = await call({
            url: "/apis/product",
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               current_name: product.name,
               name: name.trim(),
               price: priceNum,
               description: description.trim() || undefined,
               category,
               calories: calories.trim() ? parseInt(calories) : undefined,
               image: image || undefined,
               allergies: allergies.length > 0 ? allergies : undefined,
               addons:
                  addons.length > 0
                     ? addons.filter((addon) => addon.name.trim())
                     : undefined,
            }),
         });

         if (response.isOk) {
            setAlert({
               message: dict.products.updated_success,
               type: "success",
            });
            onRefresh();
            setTimeout(() => setIsOpen(false), 1500);
         } else {
            setAlert({ message: dict.products.update_failed, type: "error" });
         }
      } catch (error) {
         console.error("Error updating product:", error);
         setAlert({ message: dict.products.update_failed, type: "error" });
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal
         trigger={
            <button
               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
               aria-label={dict.products.edit_product}
            >
               <Edit2 size={16} />
            </button>
         }
         title={dict.products.edit_product}
         size="lg"
         isOpen={isOpen}
         onOpen={handleOpen}
         onClose={() => {
            setIsOpen(false);
            setAlert(null);
            setAddons(product.addons || []);
         }}
      >
         <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {alert && <Alert variant={alert.type}>{alert.message}</Alert>}

            <Field
               label={dict.products.product_name}
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder={dict.products.name_placeholder}
               required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Field
                  label={dict.products.product_price}
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={dict.products.price_placeholder}
                  required
                  min="0"
                  step="0.01"
               />

               <Field
                  label={dict.products.product_calories}
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder={dict.products.calories_placeholder}
                  min="0"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {dict.products.product_category} *
               </label>
               <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--utility-color)] focus:border-transparent"
               >
                  <option value="">{dict.products.category_placeholder}</option>
                  {categories.map((cat) => (
                     <option key={cat._id} value={cat.name}>
                        {cat.name}
                     </option>
                  ))}
               </select>
            </div>

            <Field
               label={dict.products.product_description}
               type="textarea"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder={dict.products.description_placeholder}
            />

            {/* Image Upload */}
            <div>
               <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {dict.products.product_image}
               </label>
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="edit-product-image-upload"
                     />
                     <label
                        htmlFor="edit-product-image-upload"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                     >
                        <Upload size={16} />
                        {dict.products.upload_image}
                     </label>
                     {image && (
                        <button
                           onClick={() => setImage("")}
                           className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                           type="button"
                        >
                           <X size={16} />
                        </button>
                     )}
                  </div>
                  <p className="text-xs text-gray-500">
                     {dict.products.image_size_limit}
                  </p>
                  {image && (
                     <div className="mt-2">
                        <Image
                           src={image}
                           alt="Product preview"
                           width={128}
                           height={128}
                           className="w-32 h-32 object-cover rounded-lg border"
                        />
                     </div>
                  )}
               </div>
            </div>

            {/* Allergies Selection */}
            <div>
               <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {dict.products.product_allergies}
               </label>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(availableAllergies).map(([key, value]) => (
                     <label
                        key={key}
                        className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                     >
                        <input
                           type="checkbox"
                           checked={allergies.includes(value)}
                           onChange={() => handleAllergyToggle(value)}
                           className="rounded border-gray-300 text-[var(--utility-color)] focus:ring-[var(--utility-color)]"
                        />
                        <span className="text-sm">
                           {dict.info_bar.allergy_descriptions[value] || value}
                        </span>
                     </label>
                  ))}
               </div>
               {allergies.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                     {allergies.length} {dict.products.allergies_selected}
                  </p>
               )}
            </div>

            {/* Addons Section */}
            <div>
               <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[var(--text-color)]">
                     {dict.products.product_addons}
                  </label>
                  <button
                     type="button"
                     onClick={addAddon}
                     className="flex items-center gap-1 px-3 py-1 text-sm bg-[var(--utility-color)] text-white rounded-lg hover:opacity-90 transition-all"
                  >
                     <Plus size={14} />
                     {dict.products.add_addon}
                  </button>
               </div>

               {addons.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                     {dict.products.no_addons}
                  </p>
               ) : (
                  <div className="space-y-2">
                     {addons.map((addon, index) => (
                        <div
                           key={index}
                           className="flex gap-2 items-start p-3 border rounded-lg"
                        >
                           <div className="flex-1">
                              <Field
                                 label={dict.products.addon_name}
                                 type="text"
                                 value={addon.name}
                                 onChange={(e) =>
                                    updateAddon(index, "name", e.target.value)
                                 }
                                 placeholder={
                                    dict.products.addon_name_placeholder
                                 }
                              />
                           </div>
                           <div className="w-20">
                              <Field
                                 label={dict.products.addon_price}
                                 type="number"
                                 value={addon.price.toString()}
                                 onChange={(e) =>
                                    updateAddon(
                                       index,
                                       "price",
                                       parseFloat(e.target.value) || 0
                                    )
                                 }
                                 placeholder={
                                    dict.products.addon_price_placeholder
                                 }
                                 min="0"
                                 step="0.01"
                              />
                           </div>
                           <button
                              type="button"
                              onClick={() => removeAddon(index)}
                              className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label={dict.products.remove_addon}
                           >
                              <X size={16} />
                           </button>
                        </div>
                     ))}
                  </div>
               )}

               {/* Price Summary */}
               {(price || addons.length > 0) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                     <div className="flex justify-between text-sm font-semibold">
                        <span>{dict.products.base_price}:</span>
                        <span>
                           {dict.products.currency_symbol}
                           {parseFloat(price) || 0}
                        </span>
                     </div>
                     {addons.length > 0 && (
                        <>
                           <div className="mt-2 pt-2 border-t">
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                 {dict.products.available_addons}:
                              </div>
                              {addons.map(
                                 (addon, index) =>
                                    addon.name && (
                                       <div
                                          key={index}
                                          className="flex justify-between text-sm text-gray-600"
                                       >
                                          <span>• {addon.name}</span>
                                          <span>
                                             +{dict.products.currency_symbol}
                                             {addon.price}
                                          </span>
                                       </div>
                                    )
                              )}
                           </div>
                        </>
                     )}
                  </div>
               )}
            </div>

            <div className="flex gap-3 pt-4">
               <Button
                  onClick={handleSave}
                  loading={loading}
                  className="flex-1"
               >
                  {dict.products.save_changes}
               </Button>
               <Button
                  onClick={() => setIsOpen(false)}
                  variant="secondary"
                  className="flex-1"
               >
                  {dict.products.cancel}
               </Button>
            </div>
         </div>
      </Modal>
   );
}

// Delete Product Modal
export function DeleteProductModal({
   product,
   dict,
   onRefresh,
}: {
   product: Product;
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

   const handleDelete = async () => {
      setLoading(true);
      setAlert(null);

      try {
         const response = await call({
            url: "/apis/product",
            method: "DELETE",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: product.name }),
         });

         if (response.isOk) {
            setAlert({
               message: dict.products.deleted_success,
               type: "success",
            });
            onRefresh();
            setTimeout(() => setIsOpen(false), 1500);
         } else {
            setAlert({ message: dict.products.delete_failed, type: "error" });
         }
      } catch (error) {
         console.error("Error deleting product:", error);
         setAlert({ message: dict.products.delete_failed, type: "error" });
      } finally {
         setLoading(false);
      }
   };

   return (
      <Modal
         trigger={
            <button
               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
               aria-label={dict.products.delete_product}
            >
               <Trash2 size={16} />
            </button>
         }
         title={dict.products.delete_product}
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

            <div className="text-center space-y-4">
               <div className="text-6xl">🗑️</div>
               <div>
                  <h3 className="text-lg font-semibold text-[var(--text-color)] mb-2">
                     {dict.products.delete_confirmation}
                  </h3>
                  <p className="text-gray-600">
                     {dict.products.delete_warning.replace(
                        "{name}",
                        product.name
                     )}
                  </p>
               </div>
            </div>

            <div className="flex gap-3">
               <Button
                  onClick={handleDelete}
                  loading={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
               >
                  {dict.products.confirm_delete}
               </Button>
               <Button
                  onClick={() => setIsOpen(false)}
                  variant="secondary"
                  className="flex-1"
               >
                  {dict.products.cancel}
               </Button>
            </div>
         </div>
      </Modal>
   );
}
