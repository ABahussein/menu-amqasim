"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
   Plus,
   ShoppingBag,
   Eye,
   ArrowRight,
   ArrowLeft,
   UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import useLangStore from "@/store/useLangStore";
import useUserStore, { UserRole } from "@/store/useUserStore";
import call from "@/utils/call";
import { getDictionary } from "@/dictionaries/dictionaries";
import Modal from "@/components/Modal";
import {
   CreateProductModal,
   EditProductModal,
   DeleteProductModal,
} from "./ProductModals";

interface Product {
   _id: string;
   name: string;
   price: number;
   description?: string;
   category: string;
   calories?: number;
   image?: string;
   allergies?: string[];
   addons?: { name: string; price: number }[];
   createdAt: string;
   updatedAt: string;
}

// Visitor Addon Selection Modal Component
function VisitorAddonModal({
   product,
   isOpen,
   onClose,
   dict,
}: {
   product: Product;
   isOpen: boolean;
   onClose: () => void;
   dict: ReturnType<typeof getDictionary>;
}) {
   const [selectedAddons, setSelectedAddons] = useState<boolean[]>(
      new Array(product.addons?.length || 0).fill(false)
   );

   const calculateTotal = () => {
      const basePrice = product.price;
      const addonPrice = product.addons
         ? product.addons.reduce(
              (sum, addon, index) =>
                 selectedAddons[index] ? sum + addon.price : sum,
              0
           )
         : 0;
      return basePrice + addonPrice;
   };

   const toggleAddon = (index: number) => {
      setSelectedAddons((prev) => {
         const newSelected = [...prev];
         newSelected[index] = !newSelected[index];
         return newSelected;
      });
   };

   return (
      <Modal
         trigger={<span style={{ display: "none" }} />}
         title={dict.products.customize_your_order}
         size="md"
         isOpen={isOpen}
         onClose={onClose}
      >
         <div className="p-6 space-y-4">
            {/* Product Info */}
            <div className="border-b pb-4">
               <h3 className="font-semibold text-lg">{product.name}</h3>
               {product.description && (
                  <p className="text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] text-sm mt-1">
                     {product.description}
                  </p>
               )}
               <div className="flex justify-between mt-2">
                  <span>{dict.products.base_price}:</span>
                  <span className="font-semibold">
                     {product.price.toFixed(2)}{" "}
                     <span className="icon-saudi_riyal_new"></span>
                  </span>
               </div>
            </div>

            {/* Addons Selection */}
            {product.addons && product.addons.length > 0 && (
               <div>
                  <h4 className="font-medium mb-3">
                     {dict.products.select_addons}:
                  </h4>
                  <div className="space-y-2">
                     {product.addons.map((addon, index) => (
                        <div
                           key={index}
                           className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedAddons[index]
                                 ? "bg-green-50 border-green-300"
                                 : "hover:bg-[color-mix(in_srgb,var(--bg-color)_90%,var(--text-color))]"
                           }`}
                           onClick={() => toggleAddon(index)}
                        >
                           <div className="flex items-center gap-3">
                              <input
                                 type="checkbox"
                                 checked={selectedAddons[index]}
                                 onChange={() => toggleAddon(index)}
                                 className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                              />
                              <span className="font-medium">{addon.name}</span>
                           </div>
                           <span className="text-green-600 font-semibold">
                              +{addon.price.toFixed(2)}{" "}
                              <span className="icon-saudi_riyal_new"></span>
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Price Summary */}
            <div className="border-t pt-4 bg-[color-mix(in_srgb,var(--bg-color)_95%,var(--text-color))] -mx-6 px-6 pb-6">
               {selectedAddons.some((selected) => selected) && (
                  <div className="space-y-1 mb-3">
                     <div className="flex justify-between text-sm">
                        <span>{dict.products.base_price}:</span>
                        <span>
                           {product.price.toFixed(2)}{" "}
                           <span className="icon-saudi_riyal_new"></span>
                        </span>
                     </div>
                     {product.addons?.map(
                        (addon, index) =>
                           selectedAddons[index] && (
                              <div
                                 key={index}
                                 className="flex justify-between text-sm text-green-600"
                              >
                                 <span>+ {addon.name}:</span>
                                 <span>
                                    +{addon.price.toFixed(2)}{" "}
                                    <span className="icon-saudi_riyal_new"></span>
                                 </span>
                              </div>
                           )
                     )}
                  </div>
               )}
               <div className="flex justify-between items-center font-bold text-lg">
                  <span>{dict.products.updated_total}:</span>
                  <span className="text-green-600">
                     {calculateTotal().toFixed(2)}{" "}
                     <span className="icon-saudi_riyal_new"></span>
                  </span>
               </div>
            </div>
         </div>
      </Modal>
   );
}

function ListView() {
   const [products, setProducts] = useState<Product[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const { lang } = useLangStore();
   const dict = getDictionary(lang);
   const { role } = useUserStore();
   const searchParams = useSearchParams();
   const [selectedProductForAddons, setSelectedProductForAddons] =
      useState<Product | null>(null);

   // Check if user is admin or super admin
   const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPERADMIN;

   // Get category from URL parameters
   const selectedCategory = searchParams.get("product_category");

   const fetchProducts = useCallback(async () => {
      if (!lang) return;

      try {
         setLoading(true);
         setError(null);

         // Build URL with optional category parameter
         let url = `/apis/product?lang_abbr=${lang}`;
         if (selectedCategory) {
            url += `&category=${selectedCategory}`;
         }

         const response = await call({
            url,
            method: "GET",
         });

         if (response.isOk && response.data?.products) {
            setProducts(response.data.products);
         } else {
            // Handle case where no products are found
            setProducts([]);
            if (response.msg !== "NO_PRODUCTS_FOUND") {
               setError(dict.products.error);
            }
         }
      } catch (err) {
         console.error("Error fetching products:", err);
         setError(dict.products.error);
         setProducts([]);
      } finally {
         setLoading(false);
      }
   }, [lang, dict, selectedCategory]);

   useEffect(() => {
      fetchProducts();
   }, [fetchProducts]);

   if (loading) {
      return (
         <div className="product-list-view">
            <div className="product-list-loading">
               <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {Array.from({ length: 6 }).map((_, i) => (
                        <div
                           key={i}
                           className="bg-gray-200 rounded-lg h-64"
                        ></div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="product-list-view">
            <div className="product-list-error text-center py-12">
               <UtensilsCrossed className="w-16 h-16 text-red-500 mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-red-600 mb-2">
                  {dict.products.error}
               </h3>
               <button
                  onClick={fetchProducts}
                  className="py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
               >
                  Try Again
               </button>
            </div>
         </div>
      );
   }

   if (products.length === 0) {
      return (
         <>
            <style jsx>{`
               .product-list-view {
                  // padding: 2rem;
                  background: var(--bg-color);
                  color: var(--text-color);
                  min-height: 400px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
               }

               .empty-state {
                  text-align: center;
                  max-width: 500px;
                  padding: 3rem 2rem;
                  background: white;
                  border-radius: 16px;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                  border: 1px solid var(--utility-color, #3b82f6);
               }

               .empty-state-icon {
                  font-size: 4rem;
                  margin-bottom: 1.5rem;
                  filter: grayscale(20%);
               }

               .empty-state-title {
                  font-size: 1.5rem;
                  font-weight: 600;
                  color: var(--text-color);
                  margin-bottom: 0.75rem;
               }

               .empty-state-description {
                  color: #6b7280;
                  font-size: 1rem;
                  line-height: 1.5;
                  margin-bottom: 2rem;
               }

               .admin-actions {
                  display: flex;
                  flex-direction: column;
                  gap: 1rem;
                  align-items: center;
               }

               .admin-hint {
                  font-size: 0.875rem;
                  color: var(--utility-color, #3b82f6);
                  font-weight: 500;
               }

               @media (max-width: 768px) {
                  .product-list-view {
                     // padding: 1rem;
                  }

                  .empty-state {
                     padding: 2rem 1.5rem;
                  }

                  .empty-state-icon {
                     font-size: 3rem;
                  }

                  .empty-state-title {
                     font-size: 1.25rem;
                  }
               }
            `}</style>
            <div
               className="product-list-view"
               dir={lang === "ar" ? "rtl" : "ltr"}
            >
               <div className="empty-state">
                  <div className="empty-state-icon">🍽️</div>
                  <h2 className="empty-state-title">
                     {dict.products.empty_state_title}
                  </h2>
                  <p className="empty-state-description">
                     {dict.products.empty_state_description}
                  </p>

                  {isAdmin && (
                     <div className="admin-actions">
                        <CreateProductModal
                           dict={dict}
                           onRefresh={fetchProducts}
                        />
                        <p className="admin-hint">
                           {dict.products.empty_state_admin_action}
                        </p>
                     </div>
                  )}

                  {!isAdmin && (
                     <div className="empty-state-icon">
                        <ShoppingBag className="w-12 h-12 text-[color-mix(in_srgb,var(--text-color)_40%,var(--bg-color))] mx-auto" />
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
            .product-list-view {
               // padding: 2rem;
               color: var(--text-color);
            }

            .products-header {
               display: flex;
               justify-content: space-between;
               align-items: center;
               margin-bottom: 2rem;
               flex-wrap: wrap;
               gap: 1rem;
            }

            .products-title {
               font-size: 1.75rem;
               font-weight: 600;
               color: var(--text-color);
               display: flex;
               align-items: center;
               gap: 0.5rem;
            }

            .products-grid {
               display: flex;
               flex-direction: column;
               gap: 1rem;
            }

            .product-card {
               background: var(--product-card-bg-color);
               border-radius: 12px;
               overflow: hidden;
               box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
               border: 1px solid #e5e7eb;
               transition: transform 0.2s, box-shadow 0.2s;
               position: relative;
               display: flex;
               align-items: stretch;
               cursor: pointer;
            }

            .product-card:hover {
               transform: translateY(-2px);
               box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }

            .product-image {
               width: 200px;
               height: auto;
               flex-shrink: 0;
               object-fit: cover;
               background: #f3f4f6;
               display: flex;
               align-items: center;
               justify-content: center;
               font-size: 2rem;
               color: #9ca3af;
            }

            .product-content {
               padding: 1.25rem;
               flex: 1;
               display: flex;
               flex-direction: column;
               justify-content: space-between;
            }

            .product-header {
               display: flex;
               justify-content: space-between;
               align-items: flex-start;
               margin-bottom: 0.75rem;
            }

            .product-name {
               font-size: 1.125rem;
               font-weight: 600;
               color: var(--text-color);
               margin: 0;
               line-height: 1.4;
            }

            .product-price {
               font-size: 1.25rem;
               font-weight: 700;
               color: var(--utility-color, #3b82f6);
               white-space: nowrap;
            }

            .product-category {
               font-size: 0.875rem;
               width: fit-content;
               color: color-mix(in srgb, var(--text-color) 70%, transparent);
               background: color-mix(
                  in srgb,
                  var(--text-color) 15%,
                  transparent
               );
               font-weight: bold;
               padding: 0.25rem 0.75rem;
               border-radius: 9999px;
               display: inline-block;
               margin-bottom: 0.75rem;
            }

            .product-description {
               font-size: 0.875rem;
               color: #6b7280;
               line-height: 1.5;
               margin-bottom: 0.75rem;
               display: -webkit-box;
               -webkit-line-clamp: 2;
               -webkit-box-orient: vertical;
               overflow: hidden;
            }

            .product-details {
               display: flex;
               align-items: center;
               gap: 1rem;
               margin-bottom: 0.75rem;
               font-size: 0.875rem;
               color: #6b7280;
            }

            .view-details-hint {
               display: inline-flex;
               width: fit-content;
               margin: 10px 0;
               align-items: center;
               gap: 0.5rem;
               font-size: 0.7rem;
               color: var(--utility-color, #3b82f6);
               background: color-mix(
                  in srgb,
                  var(--utility-color, #3b82f6) 10%,
                  transparent
               );
               border: 1px solid
                  color-mix(
                     in srgb,
                     var(--utility-color, #3b82f6) 20%,
                     transparent
                  );
               margin-top: auto;
               padding: 0.3rem 0.7rem;
               border-radius: 8px;
               font-weight: 500;
               transition: all 0.2s ease;
               text-decoration: none;
               cursor: pointer;
               position: relative;
               overflow: hidden;
            }

            .view-details-hint:hover {
               background: color-mix(
                  in srgb,
                  var(--utility-color, #3b82f6) 15%,
                  transparent
               );
               border-color: color-mix(
                  in srgb,
                  var(--utility-color, #3b82f6) 30%,
                  transparent
               );
               transform: translateY(-1px);
               box-shadow: 0 2px 8px
                  color-mix(
                     in srgb,
                     var(--utility-color, #3b82f6) 20%,
                     transparent
                  );
            }

            .view-details-hint::before {
               content: "";
               position: absolute;
               top: 0;
               left: -100%;
               width: 100%;
               height: 100%;
               background: linear-gradient(
                  90deg,
                  transparent,
                  color-mix(
                     in srgb,
                     var(--utility-color, #3b82f6) 20%,
                     transparent
                  ),
                  transparent
               );
               transition: left 0.5s ease;
            }

            .view-details-hint:hover::before {
               left: 100%;
            }

            .view-details-icon {
               width: 10px;
               height: 10px;
               transition: transform 0.2s ease;
            }

            .view-details-hint:hover .view-details-icon {
               transform: translateX(2px);
            }

            .addon-select-hint {
               display: inline-flex;
               width: fit-content;
               align-items: center;
               margin-bottom: 10px;
               gap: 0.5rem;
               font-size: 0.7rem;
               color: #059669;
               background: color-mix(in srgb, #059669 10%, transparent);
               border: 1px solid color-mix(in srgb, #059669 20%, transparent);
               padding: 0.3rem 0.7rem;
               border-radius: 8px;
               font-weight: 500;
               transition: all 0.2s ease;
               text-decoration: none;
               cursor: pointer;
               position: relative;
               overflow: hidden;
            }

            .addon-select-hint:hover {
               background: color-mix(in srgb, #059669 15%, transparent);
               border-color: color-mix(in srgb, #059669 30%, transparent);
               transform: translateY(-1px);
               box-shadow: 0 2px 8px
                  color-mix(in srgb, #059669 20%, transparent);
            }

            .addon-select-hint::before {
               content: "";
               position: absolute;
               top: 0;
               left: -100%;
               width: 100%;
               height: 100%;
               background: linear-gradient(
                  90deg,
                  transparent,
                  color-mix(in srgb, #059669 20%, transparent),
                  transparent
               );
               transition: left 0.5s ease;
            }

            .addon-select-hint:hover::before {
               left: 100%;
            }

            .addon-select-icon {
               width: 10px;
               height: 10px;
               transition: transform 0.2s ease;
            }

            .addon-select-hint:hover .addon-select-icon {
               transform: translateX(2px);
            }

            .admin-actions {
               display: flex;
               justify-content: flex-end;
               gap: 0.5rem;
               border-top: 1px solid #e5e7eb;
               padding-top: 0.75rem;
            }

            .no-image-placeholder {
               background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
               display: flex;
               align-items: center;
               justify-content: center;
               font-size: 2.5rem;
               color: #9ca3af;
               height: 150px;
            }

            .mobile-bottom-row {
               display: none;
            }

            @media (max-width: 768px) {
               .product-list-view {
                  // padding: 1rem;
               }

               .products-header {
                  flex-direction: column;
                  align-items: flex-start;
               }

               .products-grid {
                  grid-template-columns: 1fr;
               }

               .product-header {
                  flex-direction: column;
                  gap: 0.5rem;
               }

               .product-price {
                  font-size: 1.0625rem; /* 15% smaller than 1.25rem */
               }

               .product-image {
                  width: 170px; /* 15% smaller than 200px */
               }

               .product-content {
                  padding: 0.85rem; /* 15% smaller than 1rem (1rem * 0.85 = 0.85rem) */
               }

               .product-category {
                  display: none;
               }

               .view-details-hint {
                  display: none;
               }

               .mobile-bottom-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-top: auto;
                  gap: 0.75rem;
               }

               .mobile-category {
                  font-size: 0.75rem;
                  color: color-mix(in srgb, var(--text-color) 70%, transparent);
                  background: color-mix(
                     in srgb,
                     var(--text-color) 15%,
                     transparent
                  );
                  font-weight: bold;
                  padding: 0.2rem 0.6rem;
                  border-radius: 9999px;
                  white-space: nowrap;
               }

               .addon-select-hint {
                  padding: 0.25rem 0.6rem;
               }

               .mobile-view-details {
                  display: inline-flex;
                  align-items: center;
                  gap: 0.4rem;
                  font-size: 0.7rem;
                  color: var(--utility-color, #3b82f6);
                  background: color-mix(
                     in srgb,
                     var(--utility-color, #3b82f6) 10%,
                     transparent
                  );
                  border: 1px solid
                     color-mix(
                        in srgb,
                        var(--utility-color, #3b82f6) 20%,
                        transparent
                     );
                  padding: 0.25rem 0.6rem;
                  border-radius: 8px;
                  font-weight: 500;
                  transition: all 0.2s ease;
                  white-space: nowrap;
               }

               .mobile-view-details:hover {
                  background: color-mix(
                     in srgb,
                     var(--utility-color, #3b82f6) 15%,
                     transparent
                  );
                  transform: translateY(-1px);
               }
            }
         `}</style>
         <div className="product-list-view" dir={lang === "ar" ? "rtl" : "ltr"}>
            <div className="products-header">
               <h1 className="products-title">
                  <UtensilsCrossed className="w-7 h-7" />
                  {dict.products.products_title} ({products.length})
               </h1>
               {isAdmin && (
                  <CreateProductModal dict={dict} onRefresh={fetchProducts} />
               )}
            </div>

            <div className="products-grid">
               {products.map((product) => (
                  <Modal
                     key={product._id}
                     trigger={
                        <div className="product-card">
                           <div className="product-image">
                              {product.image ? (
                                 <Image
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    width={300}
                                    height={200}
                                 />
                              ) : (
                                 <div className="no-image-placeholder">🍽️</div>
                              )}
                           </div>

                           <div className="product-content">
                              <div className="product-header">
                                 <h3 className="product-name">
                                    {product.name}
                                 </h3>
                                 <span className="product-price">
                                    {product.price.toFixed(2)}{" "}
                                    <span className="icon-saudi_riyal_new"></span>
                                 </span>
                              </div>

                              <div className="product-category">
                                 {product.category}
                              </div>

                              {/* Buttons container - row layout on larger screens */}
                              <div className="flex gap-3 items-start">
                                 <div className="view-details-hint">
                                    <Eye
                                       className="view-details-icon"
                                       size={15}
                                    />
                                    <span>{dict.products.view_details}</span>
                                    {lang === "ar" ? (
                                       <ArrowLeft
                                          className="view-details-icon"
                                          size={15}
                                       />
                                    ) : (
                                       <ArrowRight
                                          className="view-details-icon"
                                          size={15}
                                       />
                                    )}
                                 </div>

                                 {/* Addon selection button for visitors when addons exist */}
                                 {!isAdmin &&
                                    product.addons &&
                                    product.addons.length > 0 && (
                                       <div
                                          className="addon-select-hint"
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             setSelectedProductForAddons(
                                                product
                                             );
                                          }}
                                       >
                                          <Plus
                                             className="addon-select-icon"
                                             size={15}
                                          />
                                          <span>
                                             {
                                                dict.products
                                                   .customize_your_order
                                             }
                                          </span>
                                       </div>
                                    )}
                              </div>

                              <div className="mobile-bottom-row">
                                 <div className="mobile-category">
                                    {product.category}
                                 </div>
                                 <div className="mobile-view-details">
                                    <span>{dict.products.view_details}</span>
                                    {lang === "ar" ? (
                                       <ArrowLeft size={12} />
                                    ) : (
                                       <ArrowRight size={12} />
                                    )}
                                 </div>
                              </div>

                              {isAdmin && (
                                 <div
                                    className="admin-actions"
                                    onClick={(e) => e.stopPropagation()}
                                 >
                                    <EditProductModal
                                       product={product}
                                       dict={dict}
                                       onRefresh={fetchProducts}
                                    />
                                    <DeleteProductModal
                                       product={product}
                                       dict={dict}
                                       onRefresh={fetchProducts}
                                    />
                                 </div>
                              )}
                           </div>
                        </div>
                     }
                     title={dict.products.product_details}
                     size="lg"
                  >
                     <ProductDetailsContent product={product} dict={dict} />
                  </Modal>
               ))}
            </div>

            {/* Visitor Addon Selection Modal */}
            {selectedProductForAddons && (
               <VisitorAddonModal
                  product={selectedProductForAddons}
                  isOpen={!!selectedProductForAddons}
                  onClose={() => setSelectedProductForAddons(null)}
                  dict={dict}
               />
            )}
         </div>
      </>
   );
}

// Product Details Content Component
function ProductDetailsContent({
   product,
   dict,
}: {
   product: Product;
   dict: ReturnType<typeof getDictionary>;
}) {
   return (
      <>
         <style jsx>{`
            .product-image-large {
               width: 100%;
               height: 300px;
               object-fit: cover;
               border-radius: 12px;
               margin-bottom: 1.5rem;
               background: #f3f4f6;
               display: flex;
               align-items: center;
               justify-content: center;
               font-size: 4rem;
               color: #9ca3af;
            }

            .product-info {
               display: grid;
               gap: 1.5rem;
            }

            .info-row {
               display: flex;
               justify-content: space-between;
               align-items: center;
               padding: 1rem;
               background: #f9fafb;
               border-radius: 8px;
            }

            .info-label {
               font-weight: 600;
               color: #374151;
               font-size: 0.875rem;
               text-transform: uppercase;
               letter-spacing: 0.5px;
            }

            .info-value {
               font-size: 1rem;
               color: #6b7280;
               text-align: right;
            }

            .price-value {
               font-size: 1.25rem;
               font-weight: 700;
               color: var(--utility-color, #3b82f6);
            }

            .description-section {
               background: #f9fafb;
               padding: 1.5rem;
               border-radius: 12px;
               margin: 1.5rem 0;
            }

            .description-title {
               font-weight: 600;
               color: #374151;
               margin-bottom: 0.75rem;
               font-size: 1rem;
            }

            .description-text {
               color: #6b7280;
               line-height: 1.6;
            }

            .allergies-section {
               background: #fef2f2;
               border: 1px solid #fecaca;
               padding: 1rem;
               border-radius: 8px;
               margin-top: 1rem;
            }

            .allergies-title {
               font-weight: 600;
               color: #dc2626;
               margin-bottom: 0.5rem;
               display: flex;
               align-items: center;
               gap: 0.5rem;
            }

            .allergies-list {
               color: #ef4444;
               font-size: 0.875rem;
            }

            @media (max-width: 768px) {
               .product-image-large {
                  height: 250px;
               }

               .info-row {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 0.5rem;
               }

               .info-value {
                  text-align: left;
               }
            }
         `}</style>
         <div>
            <div className="product-image-large">
               {product.image ? (
                  <Image
                     src={product.image}
                     alt={product.name}
                     className="w-full h-full object-cover rounded-xl"
                     width={600}
                     height={300}
                  />
               ) : (
                  <div>🍽️</div>
               )}
            </div>

            <div className="product-info">
               <div className="info-row">
                  <span className="info-label">
                     {dict.products.product_name}
                  </span>
                  <span className="info-value">{product.name}</span>
               </div>

               <div className="info-row">
                  <span className="info-label">
                     {dict.products.product_price}
                  </span>
                  <span className="info-value price-value">
                     {product.price.toFixed(2)}{" "}
                     <span className="icon-saudi_riyal_new"></span>
                  </span>
               </div>

               {product.addons && product.addons.length > 0 && (
                  <>
                     <div className="info-row">
                        <span className="info-label">
                           {dict.products.product_addons}
                        </span>
                        <div className="info-value">
                           {product.addons.map((addon, index) => (
                              <div key={index} className="text-sm">
                                 + {addon.name}: {addon.price.toFixed(2)}{" "}
                                 <span className="icon-saudi_riyal_new"></span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </>
               )}

               <div className="info-row">
                  <span className="info-label">
                     {dict.products.product_category}
                  </span>
                  <span className="info-value">{product.category}</span>
               </div>

               {product.calories && (
                  <div className="info-row">
                     <span className="info-label">
                        {dict.products.product_calories}
                     </span>
                     <span className="info-value">
                        {product.calories} {dict.products.calories_unit}
                     </span>
                  </div>
               )}
            </div>

            {product.description && (
               <div className="description-section">
                  <div className="description-title">
                     {dict.products.product_description}
                  </div>
                  <div className="description-text">{product.description}</div>
               </div>
            )}

            {product.allergies && product.allergies.length > 0 && (
               <div className="allergies-section">
                  <div className="allergies-title">
                     ⚠️ {dict.products.allergies_label}
                  </div>
                  <div className="allergies-list">
                     {product.allergies.join(", ")}
                  </div>
               </div>
            )}
         </div>
      </>
   );
}

export default ListView;
