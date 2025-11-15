"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import useLangStore from "@/store/useLangStore";
import useUserStore, { UserRole } from "@/store/useUserStore";
import call from "@/utils/call";
import {
   CreateCategoryModal,
   EditCategoryModal,
   DeleteCategoryModal,
} from "./CategoryModals";

interface Category {
   _id: string;
   name: string;
   description?: string;
   image?: string;
   lang_abbr: "en" | "ar";
   createdAt: string;
   updatedAt: string;
}

interface Dictionary {
   categories: {
      loading: string;
      error: string;
      empty: string;
      select_category: string;
      all_categories: string;
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
   [key: string]: unknown;
}

function CategorySlider({ dict }: { dict: Dictionary }) {
   const [categories, setCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const { lang } = useLangStore();
   const { role } = useUserStore();
   const router = useRouter();
   const searchParams = useSearchParams();

   // Check if user is admin or super admin
   const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPERADMIN;

   // Helper function to scroll to products section
   const scrollToProducts = () => {
      // Small delay to allow the component re-render after URL change
      setTimeout(() => {
         // Find the products section
         const productsSection =
            document.querySelector(
               ".product-list-view, .product-grid-view, .product-image-view"
            ) ||
            document.querySelector('[class*="product"]') ||
            document.querySelector("main");

         if (productsSection) {
            // Calculate position to scroll to the top of products section
            const rect = productsSection.getBoundingClientRect();
            const currentScroll = window.scrollY;
            const targetPosition = currentScroll + rect.top - 50; // 50px offset from top

            window.scrollTo({
               top: targetPosition,
               behavior: "smooth",
            });
         } else {
            // Fallback: scroll down 100px from current position
            const currentPosition = window.scrollY;
            const targetPosition = currentPosition + 100;

            window.scrollTo({
               top: targetPosition,
               behavior: "smooth",
            });
         }
      }, 200); // Wait for component re-render
   };

   const fetchCategories = useCallback(async () => {
      if (!lang) return;

      try {
         setLoading(true);
         setError(null);

         const response = await call({
            url: `/apis/category?lang_abbr=${lang}`,
            method: "GET",
         });

         if (response.isOk && response.data?.categories) {
            setCategories(response.data.categories);
         } else {
            // Handle case where no categories are found
            setCategories([]);
            if (response.msg === "NO_CATEGORIES_FOUND") {
               setError(null); // This is not really an error, just empty state
            } else {
               setError(response.msg || "Failed to fetch categories");
            }
         }
      } catch (err) {
         console.error("Error fetching categories:", err);
         setError("Failed to load categories");
         setCategories([]);
      } finally {
         setLoading(false);
      }
   }, [lang]);

   useEffect(() => {
      fetchCategories();
   }, [fetchCategories]);
   if (loading) {
      return (
         <div className="category-slider">
            <div className="category-slider-loading">
               <div className="loading-text">{dict.categories.loading}</div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="category-slider">
            <div className="category-slider-error">
               <div className="error-text">{error}</div>
            </div>
         </div>
      );
   }

   if (categories.length === 0) {
      return (
         <>
            <style jsx>{`
               .category-slider {
               }

               .category-slider-empty {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 3rem 1rem;
                  text-align: center;
                  border-radius: 16px;
                  background: linear-gradient(
                     135deg,
                     var(--bg-color) 0%,
                     rgba(255, 255, 255, 0.05) 100%
                  );
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  -webkit-backdrop-filter: blur(10px);
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1),
                     inset 0 1px 0 rgba(255, 255, 255, 0.1);
                  position: relative;
                  overflow: hidden;
                  min-height: 200px;
               }

               .category-slider-empty::before {
                  content: "";
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(
                     90deg,
                     transparent,
                     rgba(255, 255, 255, 0.05),
                     transparent
                  );
                  animation: shimmer 3s ease-in-out infinite;
               }

               .category-slider-empty:hover {
                  transform: translateY(-2px);
                  transition: transform 0.3s ease;
                  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15),
                     inset 0 1px 0 rgba(255, 255, 255, 0.15);
               }

               .empty-icon {
                  width: 80px;
                  height: 80px;
                  margin-bottom: 1.5rem;
                  opacity: 0.6;
                  font-size: 4rem;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: linear-gradient(
                     135deg,
                     var(--utility-color) 0%,
                     var(--text-color) 100%
                  );
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  animation: float 3s ease-in-out infinite;
               }

               .empty-title {
                  font-size: 1.25rem;
                  font-weight: 600;
                  color: var(--text-color);
                  margin-bottom: 0.75rem;
                  opacity: 0.9;
               }

               .empty-subtitle {
                  font-size: 0.9rem;
                  color: var(--text-color);
                  opacity: 0.6;
                  line-height: 1.5;
                  margin-bottom: 2rem;
                  max-width: 300px;
               }

               .empty-actions {
                  display: flex;
                  gap: 1rem;
                  align-items: center;
                  justify-content: center;
               }

               .create-first-category {
                  background: linear-gradient(
                     135deg,
                     var(--utility-color) 0%,
                     var(--text-color) 100%
                  );
                  color: white;
                  border: none;
                  border-radius: 12px;
                  padding: 0.75rem 1.5rem;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  font-size: 0.95rem;
                  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
               }

               .create-first-category:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
               }

               .create-first-category:active {
                  transform: translateY(0);
               }

               @keyframes float {
                  0%,
                  100% {
                     transform: translateY(0px);
                  }
                  50% {
                     transform: translateY(-10px);
                  }
               }

               @keyframes shimmer {
                  0% {
                     left: -100%;
                  }
                  100% {
                     left: 100%;
                  }
               }

               /* Mobile responsive */
               @media (max-width: 768px) {
                  .category-slider-empty {
                     padding: 2rem 1rem;
                     margin: 0.5rem;
                  }

                  .empty-icon {
                     width: 60px;
                     height: 60px;
                     font-size: 3rem;
                     margin-bottom: 1rem;
                  }

                  .empty-title {
                     font-size: 1.1rem;
                  }

                  .empty-subtitle {
                     font-size: 0.85rem;
                     margin-bottom: 1.5rem;
                  }
               }
            `}</style>
            <div
               className="category-slider"
               dir={lang === "ar" ? "rtl" : "ltr"}
            >
               <div className="category-slider-empty">
                  <div className="empty-icon">🍽️</div>
                  <div className="empty-title">{dict.categories.empty}</div>
                  <div className="empty-subtitle">
                     {isAdmin
                        ? lang === "ar"
                           ? "ابدأ بتنظيم قائمة طعامك عن طريق إنشاء أول فئة"
                           : "Start organizing your menu by creating your first category"
                        : lang === "ar"
                        ? "ستظهر الفئات هنا بمجرد إضافتها من قبل المدير"
                        : "Categories will appear here once they are added by the admin"}
                  </div>
                  {isAdmin && (
                     <div className="empty-actions">
                        <CreateCategoryModal
                           dict={dict}
                           onRefresh={fetchCategories}
                           trigger={
                              <button className="create-first-category">
                                 <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                 >
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                 </svg>
                                 {dict.categories.create_category}
                              </button>
                           }
                        />
                     </div>
                  )}
               </div>
            </div>
         </>
      );
   }

   return (
      <>
         <style jsx>{`
            .category-slider-loading,
            .category-slider-error,
            .category-slider-empty {
               display: flex;
               justify-content: center;
               align-items: center;
               padding: 1.5rem;
               color: var(--text-color);
               text-align: center;
            }

            .loading-text,
            .error-text,
            .empty-text {
               font-size: 1rem;
               opacity: 0.7;
            }

            /* Separate container for add button and categories */
            .categories-wrapper {
               display: flex;
               gap: 0.75rem;
               align-items: center;
            }

            .add-category-section {
               flex-shrink: 0; /* Prevent shrinking */
               max-width: 140px; /* Limit width on smaller screens */
            }

            .categories-scroll {
               flex: 1;
               overflow-x: auto;
               scroll-behavior: smooth;
               -webkit-overflow-scrolling: touch;
            }

            .categories-list {
               display: flex;
               gap: 0.75rem;
               padding: 0 0.25rem;
               min-width: min-content;
            }

            /* Center categories when they fit in one view */
            @media (min-width: 769px) {
               .add-category-section {
                  max-width: none; /* Remove width restriction on larger screens */
               }

               .categories-list {
                  justify-content: center;
               }

               /* When there's no overflow, center the wrapper */
               .categories-wrapper {
                  justify-content: center;
               }
            }

            /* Mobile adjustments */
            @media (max-width: 768px) {
               .categories-wrapper {
                  gap: 0.5rem;
               }

               .add-category-section {
                  min-width: 100px;
               }
            }

            .categories-scroll::-webkit-scrollbar {
               height: 6px;
            }

            .categories-scroll::-webkit-scrollbar-track {
               background: rgba(0, 0, 0, 0.1);
               border-radius: 3px;
            }

            .categories-scroll::-webkit-scrollbar-thumb {
               background: var(--utility-color);
               border-radius: 3px;
            }

            .categories-scroll::-webkit-scrollbar-thumb:hover {
               background: var(--text-color);
            }

            .category-card {
               display: flex;
               flex-direction: column;
               width: 110px;
               background: var(--category-card-bg-color);
               border-radius: 16px;
               padding: 0;
               box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
                  0 2px 4px rgba(0, 0, 0, 0.05);
               transition: all 0.3s ease;
               cursor: pointer;
               flex-shrink: 0;
               position: relative;
               border: 1px solid rgba(255, 255, 255, 0.1);
               overflow: hidden;
               height: 140px;
            }

            .category-card:hover {
               transform: translateY(-4px) scale(1.02);
               box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15),
                  0 4px 10px rgba(0, 0, 0, 0.1);
               border: 1px solid rgba(255, 255, 255, 0.2);
            }

            /* Ensure edit/delete buttons appear above the image */
            .category-admin-buttons {
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               z-index: 20;
               pointer-events: none;
            }

            .category-admin-buttons > :global(*) {
               pointer-events: all;
            }

            .category-image-container {
               width: 100%;
               height: 70%;
               border-radius: 16px 16px 0 0;
               overflow: hidden;
               background: var(--bg-color);
               display: flex;
               align-items: center;
               justify-content: center;
               position: relative;
               transition: all 0.3s ease;
            }

            .category-card:hover .category-image-container {
               transform: scale(1.02);
            }

            .category-card:hover .category-image-container::after {
               content: "";
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               bottom: 0;
               background: rgba(0, 0, 0, 0.1);
               z-index: 1;
            }

            .category-image-placeholder {
               width: 100%;
               height: 100%;
               display: flex;
               align-items: center;
               justify-content: center;
               background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }

            .all-categories-icon {
               width: 100%;
               height: 100%;
               display: flex;
               align-items: center;
               justify-content: center;
               background: linear-gradient(
                  135deg,
                  var(--utility-color),
                  var(--text-color)
               );
               font-size: 2.5rem;
               color: white;
               text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
               transition: all 0.3s ease;
               position: relative;
            }

            .all-categories-icon::before {
               content: "";
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               bottom: 0;
               background: linear-gradient(
                  45deg,
                  transparent 30%,
                  rgba(255, 255, 255, 0.1) 50%,
                  transparent 70%
               );
               transform: translateX(-100%);
               transition: transform 0.6s ease;
            }

            .category-card:hover .all-categories-icon {
               background: linear-gradient(
                  135deg,
                  var(--text-color),
                  var(--utility-color)
               );
            }

            .category-card:hover .all-categories-icon::before {
               transform: translateX(100%);
            }

            .category-icon {
               font-size: 3rem;
               opacity: 0.7;
               transition: all 0.3s ease;
            }

            .category-card:hover .category-icon {
               opacity: 0.9;
               transform: scale(1.1);
            }

            .category-name {
               font-size: 0.85rem;
               font-weight: 700;
               color: var(--text-color);
               text-align: center;
               line-height: 1.2;
               word-break: break-word;
               hyphens: auto;
               max-width: 100%;
               transition: all 0.3s ease;
               padding: 0.5rem;
               height: 30%;
               display: flex;
               align-items: center;
               justify-content: center;
               background: rgba(255, 255, 255, 0.02);
               backdrop-filter: blur(10px);
               position: relative;
            }

            .category-name::before {
               content: "";
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               height: 1px;
               background: linear-gradient(
                  90deg,
                  transparent,
                  rgba(255, 255, 255, 0.1),
                  transparent
               );
            }

            .category-card:hover .category-name {
               color: var(--utility-color);
               background: rgba(255, 255, 255, 0.05);
            }

            /* RTL Support */
            .category-slider[dir="rtl"] .categories-container {
               direction: rtl;
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
               .categories-container {
                  gap: 0.5rem;
               }

               .category-card {
                  width: 100px;
                  height: 130px;
               }

               .category-image-container {
                  height: 70%;
               }

               .category-name {
                  font-size: 0.8rem;
                  padding: 0.4rem;
                  height: 30%;
               }

               .category-icon {
                  font-size: 2.5rem;
               }

               .all-categories-icon {
                  font-size: 2rem;
               }
            }

            /* Focus styles for accessibility */
            .category-card:focus {
               outline: 2px solid var(--utility-color);
               outline-offset: 2px;
            }

            /* Add Category Card Styles */
            .add-category-card {
               display: flex;
               flex-direction: column;
               align-items: center;
               justify-content: center;
               min-width: 110px;
               max-width: 130px;
               height: 120px;
               background: linear-gradient(
                  135deg,
                  var(--utility-color),
                  color-mix(in srgb, var(--utility-color) 85%, white)
               );
               border-radius: 16px;
               padding: 0.75rem 0.5rem;
               box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15),
                  0 2px 4px rgba(0, 0, 0, 0.1);
               transition: all 0.3s ease;
               cursor: pointer;
               flex-shrink: 0;
               position: relative;
               border: 2px dashed rgba(255, 255, 255, 0.4);
               color: white;
               overflow: hidden;
            }

            .add-category-card:hover {
               transform: translateY(-3px) scale(1.02);
               box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
               border-color: rgba(255, 255, 255, 0.5);
            }

            .add-category-card:active {
               transform: translateY(-1px) scale(0.98);
            }

            .add-category-card::before {
               content: "";
               position: absolute;
               top: -50%;
               left: -50%;
               width: 200%;
               height: 200%;
               background: linear-gradient(
                  45deg,
                  transparent,
                  rgba(255, 255, 255, 0.1),
                  transparent
               );
               transform: rotate(45deg);
               transition: all 0.5s ease;
               opacity: 0;
            }

            .add-category-card:hover::before {
               animation: shimmer 0.8s ease-in-out;
               opacity: 1;
            }

            @keyframes shimmer {
               0% {
                  transform: translateX(-100%) translateY(-100%) rotate(45deg);
               }
               100% {
                  transform: translateX(100%) translateY(100%) rotate(45deg);
               }
            }

            .add-icon-container {
               width: 60px;
               height: 60px;
               border-radius: 50%;
               background: rgba(255, 255, 255, 0.25);
               display: flex;
               align-items: center;
               justify-content: center;
               margin-bottom: 0.6rem;
               backdrop-filter: blur(10px);
               border: 2px solid rgba(255, 255, 255, 0.4);
               transition: all 0.3s ease;
               box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .add-category-card:hover .add-icon-container {
               background: rgba(255, 255, 255, 0.35);
               transform: rotate(90deg) scale(1.05);
               box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            }

            .add-category-text {
               font-size: 0.9rem;
               font-weight: 700;
               text-align: center;
               line-height: 1.3;
               text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
               max-width: 100%;
               transition: all 0.3s ease;
            }

            .add-category-card:hover .add-category-text {
               transform: translateY(-1px);
            }

            /* Mobile responsiveness for add button */
            @media (max-width: 768px) {
               .add-category-card {
                  min-width: 95px;
                  max-width: 105px;
                  height: 110px;
                  padding: 0.6rem 0.4rem;
               }

               .add-icon-container {
                  width: 50px;
                  height: 50px;
                  margin-bottom: 0.5rem;
               }

               .add-category-text {
                  font-size: 0.8rem;
               }
            }
         `}</style>
         <div className="category-slider" dir={lang === "ar" ? "rtl" : "ltr"}>
            <div className="categories-container">
               <div className="categories-wrapper">
                  {isAdmin && (
                     <div className="add-category-section">
                        <CreateCategoryModal
                           dict={dict}
                           onRefresh={fetchCategories}
                           trigger={
                              <div
                                 className="add-category-card"
                                 tabIndex={0}
                                 role="button"
                                 aria-label={dict.categories.add_category}
                                 onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                       e.preventDefault();
                                       // The modal will handle the click
                                    }
                                 }}
                              >
                                 <div className="add-icon-container">
                                    <svg
                                       width="24"
                                       height="24"
                                       viewBox="0 0 24 24"
                                       fill="none"
                                       stroke="currentColor"
                                       strokeWidth="2.5"
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                    >
                                       <line
                                          x1="12"
                                          y1="5"
                                          x2="12"
                                          y2="19"
                                       ></line>
                                       <line
                                          x1="5"
                                          y1="12"
                                          x2="19"
                                          y2="12"
                                       ></line>
                                    </svg>
                                 </div>
                                 <div className="add-category-text">
                                    {dict.categories.add_category}
                                 </div>
                              </div>
                           }
                        />
                     </div>
                  )}
                  <div className="categories-scroll">
                     <div className="categories-list mb-6 mt-2">
                        {/* All Categories Button */}
                        <div
                           className="category-card"
                           tabIndex={0}
                           role="button"
                           aria-label={dict.categories.all_categories}
                           onClick={() => {
                              // Clear product_category parameter to show all products
                              const params = new URLSearchParams(
                                 searchParams.toString()
                              );
                              params.delete("product_category");
                              const newUrl = params.toString()
                                 ? `?${params.toString()}`
                                 : window.location.pathname;
                              router.replace(newUrl, { scroll: false });
                              scrollToProducts();
                           }}
                           onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                 e.preventDefault();
                                 // Clear product_category parameter to show all products
                                 const params = new URLSearchParams(
                                    searchParams.toString()
                                 );
                                 params.delete("product_category");
                                 const newUrl = params.toString()
                                    ? `?${params.toString()}`
                                    : window.location.pathname;
                                 router.replace(newUrl, { scroll: false });
                                 scrollToProducts();
                              }
                           }}
                           style={{ position: "relative" }}
                        >
                           <div className="category-image-container">
                              <div className="category-image all-categories-icon"></div>
                           </div>
                           <div className="category-name">
                              {dict.categories.all_categories}
                           </div>
                        </div>
                        {categories.map((category) => (
                           <div
                              key={category._id}
                              className="category-card"
                              tabIndex={0}
                              role="button"
                              aria-label={`${dict.categories.select_category}: ${category.name}`}
                              onClick={() => {
                                 // Update URL with product_category parameter
                                 const params = new URLSearchParams(
                                    searchParams.toString()
                                 );
                                 params.set("product_category", category.name);
                                 router.replace(`?${params.toString()}`, {
                                    scroll: false,
                                 });
                                 scrollToProducts();
                              }}
                              onKeyDown={(e) => {
                                 if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    // Update URL with product_category parameter
                                    const params = new URLSearchParams(
                                       searchParams.toString()
                                    );
                                    params.set(
                                       "product_category",
                                       category.name
                                    );
                                    router.replace(`?${params.toString()}`, {
                                       scroll: false,
                                    });
                                    scrollToProducts();
                                 }
                              }}
                              style={{ position: "relative" }}
                           >
                              {isAdmin && (
                                 <div className="category-admin-buttons">
                                    <DeleteCategoryModal
                                       category={category}
                                       dict={dict}
                                       onRefresh={fetchCategories}
                                    />
                                    <EditCategoryModal
                                       category={category}
                                       dict={dict}
                                       onRefresh={fetchCategories}
                                    />
                                 </div>
                              )}
                              <div className="category-image-container">
                                 {category.image ? (
                                    <Image
                                       src={category.image}
                                       alt={category.name}
                                       className="category-image"
                                       width={130}
                                       height={84}
                                       style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                          transition: "all 0.3s ease",
                                       }}
                                       priority={false}
                                    />
                                 ) : (
                                    <div className="category-image-placeholder">
                                       <span className="category-icon">🍽️</span>
                                    </div>
                                 )}
                              </div>
                              <div className="category-name">
                                 {category.name}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
}

export default CategorySlider;
