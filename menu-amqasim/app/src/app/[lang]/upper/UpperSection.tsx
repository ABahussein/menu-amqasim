"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import useContentStore from "@/store/useContentStore";
import useUserStore, { UserRole } from "@/store/useUserStore";
import useLangStore from "@/store/useLangStore";
import call from "@/utils/call";
import InfoBar from "./InfoBar";
import { TextEditModal, ImageEditModal } from "./EditModals";
import ImageSlider from "@/components/ImageSlider";
import HeaderImagesModal from "./HeaderImagesModal";

interface UpperSectionProps {
   dict: {
      upper_section: {
         restaurant_name_placeholder: string;
         restaurant_description_placeholder: string;
         header_image_placeholder: string;
         edit_header_image: string;
         edit_logo: string;
         edit_restaurant_name: string;
         edit_restaurant_description: string;
         upload_header_image: string;
         upload_logo: string;
         header_image_size_limit: string;
         logo_size_limit: string;
         save_changes: string;
         cancel: string;
         restaurant_name: string;
         restaurant_description: string;
         header_image: string;
         logo: string;
         manage_header_images: string;
         add_image: string;
         remove_image: string;
         reorder_images: string;
         no_images_yet: string;
         drag_to_reorder: string;
         image_uploaded: string;
         max_images_reached: string;
         upload_images: string;
         select_images: string;
         images_count: string; // <-- Added missing property
      };
      info_bar: {
         locations: string;
         phone: string;
         whatsapp: string;
         email: string;
         reviews: string;
         information: string;
         facebook: string;
         twitter: string;
         instagram: string;
         linkedin: string;
         youtube: string;
         share_link: string;
         allergies: string;
         contact_us: string;
         social_media: string;
         no_location: string;
         no_phone: string;
         no_whatsapp: string;
         no_email: string;
         no_reviews: string;
         no_information: string;
         no_facebook: string;
         no_twitter: string;
         no_instagram: string;
         no_linkedin: string;
         no_youtube: string;
         no_share_link: string;
         no_allergies: string;
         edit_location: string;
         edit_phone: string;
         edit_whatsapp: string;
         edit_email: string;
         edit_reviews: string;
         edit_information: string;
         edit_facebook: string;
         edit_twitter: string;
         edit_instagram: string;
         edit_linkedin: string;
         edit_youtube: string;
         edit_share_link: string;
         edit_allergies: string;
         location_placeholder: string;
         phone_placeholder: string;
         whatsapp_placeholder: string;
         email_placeholder: string;
         reviews_placeholder: string;
         information_placeholder: string;
         facebook_placeholder: string;
         twitter_placeholder: string;
         instagram_placeholder: string;
         linkedin_placeholder: string;
         youtube_placeholder: string;
         share_link_placeholder: string;
         allergies_placeholder: string;
         allergies_instruction: string;
         allergy_descriptions: Record<string, string>;
         allergies_info: string;
         allergies_modal_intro: string;
         allergies_important_notice: string;
         click_for_details: string;
         click_to_view: string;
         add_information_hint: string;
         close: string;
         add_new_location: string;
         enter_location_placeholder: string;
         save: string;
         cancel: string;
         no_locations_yet: string;
         add_first_location: string;
         add_facebook: string;
         add_instagram: string;
         add_twitter: string;
         add_linkedin: string;
         add_youtube: string;
         saving: string;
         share_our_restaurant: string;
         add_contact_info: string;
         add_social_media: string;
      };
   };
}

function UpperSection({ dict }: UpperSectionProps) {
   const { name, desc, logo, header_images, setContent, info_bar, lang_abbr } =
      useContentStore();
   const { role, token } = useUserStore();
   const { lang } = useLangStore();

   const [loading, setLoading] = useState(false);
   const [showHeaderImagesModal, setShowHeaderImagesModal] = useState(false);

   const isSuperAdmin = role === UserRole.SUPERADMIN;
   const isAdmin = role === UserRole.ADMIN;
   const canManageContent = isSuperAdmin || isAdmin;

   // Determine logo position based on language direction
   const isRTL = lang === "ar";
   const logoPositionClasses = isRTL
      ? "absolute -bottom-12 left-1/2 transform -translate-x-1/2 md:right-8 md:left-auto md:translate-x-0"
      : "absolute -bottom-12 left-1/2 transform -translate-x-1/2 md:left-8 md:translate-x-0";

   const handleHeaderImagesSave = async (images: string[]) => {
      setLoading(true);
      try {
         const updateData: Record<string, string | string[]> = {};
         updateData.header_images = images;
         updateData.lang_abbr = lang || "ar";

         const { isOk, data, msg } = await call({
            url: "/apis/content",
            method: "PUT",
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
         });

         if (!isOk) {
            console.error("Failed to update header images:", msg);
         } else if (data) {
            // Update the store with the new content
            setContent(name, desc, logo, images, null, info_bar, lang_abbr);
            setShowHeaderImagesModal(false);
         }
      } catch (error) {
         console.error("Error updating header images:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleSave = async (field: string, value: string) => {
      setLoading(true);
      try {
         const updateData: Record<string, string | string[]> = {};

         // Handle header_images as an array
         if (field === "header_images") {
            updateData[field] = [value]; // Convert single image to array
         } else {
            updateData[field] = value;
         }
         updateData.lang_abbr = lang || "ar";

         const { isOk, data, msg } = await call({
            url: "/apis/content",
            method: "PUT",
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
         });

         if (!isOk) {
            console.error("Failed to update content:", msg);
         } else if (data) {
            // Update the store with the new content
            setContent(
               field === "name" ? value : name,
               field === "desc" ? value : desc,
               field === "logo" ? value : logo,
               field === "header_images" ? [value] : header_images,
               field === "bg_image" ? value : null,
               info_bar,
               lang_abbr
            );
         }
      } catch (error) {
         console.error("Error updating content:", error);
      } finally {
         setLoading(false);
      }
   };

   const getEditLabel = (field: string) => {
      switch (field) {
         case "header_images":
            return dict.upper_section.edit_header_image;
         case "logo":
            return dict.upper_section.edit_logo;
         case "name":
            return dict.upper_section.edit_restaurant_name;
         case "desc":
            return dict.upper_section.edit_restaurant_description;
         default:
            return `Edit ${field}`;
      }
   };

   const getFieldLabel = (field: string) => {
      switch (field) {
         case "header_images":
            return dict.upper_section.header_image;
         case "logo":
            return dict.upper_section.logo;
         case "name":
            return dict.upper_section.restaurant_name;
         case "desc":
            return dict.upper_section.restaurant_description;
         default:
            return field;
      }
   };

   return (
      <div className="upper-section relative">
         {/* Restaurant Header Images Slider */}
         <div className="relative group -mx-1">
            <ImageSlider
               images={header_images || []}
               className="restaurant-image rounded-b-2xl header-image w-full h-72 md:h-80 lg:h-96 bg-[color-mix(in_srgb,var(--bg-color)_95%,var(--utility-color))]"
               autoPlay={true}
               autoPlayInterval={6000}
               showControls={true}
               showIndicators={true}
               aspectRatio="h-72 md:h-80 lg:h-96"
               placeholder={dict.upper_section.header_image_placeholder}
               isRTL={isRTL}
            >
               {/* Admin controls overlay */}
               {canManageContent && (
                  <div
                     className={`absolute top-4 z-10 ${
                        isRTL ? "right-4" : "left-4"
                     }`}
                  >
                     <button
                        onClick={() => setShowHeaderImagesModal(true)}
                        className="bg-[var(--utility-color)] hover:bg-[var(--utility-color)]/80 text-white rounded-lg px-3 py-2 transition-all duration-200 shadow-lg flex items-center gap-2 text-sm font-medium"
                        title={dict.upper_section.manage_header_images}
                     >
                        <ImageIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">
                           {header_images && header_images.length > 0
                              ? `${header_images.length} ${
                                   lang === "ar" ? "صور" : "images"
                                }`
                              : dict.upper_section.add_image}
                        </span>
                        {/* Small edit indicator */}
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                     </button>
                  </div>
               )}

               {/* Central Add Images Button (when no images exist) */}
               {canManageContent &&
                  (!header_images || header_images.length === 0) && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <button
                           onClick={() => setShowHeaderImagesModal(true)}
                           className="bg-[var(--utility-color)] hover:bg-[var(--utility-color)]/90 text-white rounded-xl px-6 py-4 transition-all duration-200 shadow-xl flex items-center gap-3 text-base font-semibold transform hover:scale-105"
                        >
                           <ImageIcon className="w-6 h-6" />
                           <span>{dict.upper_section.add_image}</span>
                        </button>
                     </div>
                  )}
            </ImageSlider>

            {/* Logo positioned over the header image */}
            <div className={logoPositionClasses}>
               <div className="relative group">
                  <div className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-white border-3 border-white shadow-2xl shadow-black/20 overflow-hidden flex items-center justify-center relative">
                     {/* Subtle inner border */}
                     <div className="absolute rounded-full " />

                     {logo ? (
                        <Image
                           src={logo}
                           alt="Restaurant Logo"
                           width={144}
                           height={144}
                           className="w-full h-full object-cover rounded-full"
                        />
                     ) : (
                        <div className="w-full h-full bg-[color-mix(in_srgb,var(--bg-color)_95%,var(--utility-color))] rounded-full flex items-center justify-center">
                           <ImageIcon className="w-8 h-8 md:w-12 md:h-12 text-[color-mix(in_srgb,var(--text-color)_60%,transparent)]" />
                        </div>
                     )}
                  </div>

                  {isSuperAdmin && (
                     <div className="absolute -top-1 -right-1">
                        <ImageEditModal
                           field="logo"
                           label={getFieldLabel("logo")}
                           editLabel={getEditLabel("logo")}
                           value={logo || ""}
                           onSave={handleSave}
                           loading={loading}
                           dict={dict}
                        />
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Restaurant Info: Name and Description */}
         <div className="restaurant-info mt-12">
            {/* High contrast floating card */}
            <div className="relative max-w-xl mx-auto">
               {/* Main content card with enhanced contrast */}
               <div className="bg-white backdrop-blur-xl rounded-2xl p-4 md:p-5 relative overflow-hidden shadow-lg shadow-black/5 border-2 border-[var(--utility-color)]/20">
                  {/* Enhanced top accent */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-gradient-to-r from-transparent via-[var(--utility-color)]/80 to-transparent rounded-b-full" />

                  {/* Enhanced side ornaments */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-transparent via-[var(--utility-color)]/50 to-transparent rounded-r-full" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-transparent via-[var(--utility-color)]/50 to-transparent rounded-l-full" />

                  {/* Enhanced background texture */}
                  <div
                     className="absolute inset-0 opacity-[0.03]"
                     style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23456274' fill-opacity='0.8'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                     }}
                  />

                  <div className="relative text-center space-y-4">
                     {/* Restaurant Name */}
                     <div className="relative group">
                        <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text-color)] leading-tight tracking-wide mb-2 drop-shadow-sm">
                           {name ||
                              dict.upper_section.restaurant_name_placeholder}
                        </h1>

                        {/* Enhanced divider */}
                        <div className="flex items-center justify-center space-x-2 mb-1">
                           <div className="w-8 h-0.5 bg-[var(--utility-color)]/60 rounded-full" />
                           <div className="w-2 h-2 rounded-full bg-[var(--utility-color)]/70 rotate-45 transform shadow-sm" />
                           <div className="w-8 h-0.5 bg-[var(--utility-color)]/60 rounded-full" />
                        </div>

                        {isSuperAdmin && (
                           <div className="absolute -top-2 -right-2">
                              <TextEditModal
                                 field="name"
                                 label={getFieldLabel("name")}
                                 editLabel={getEditLabel("name")}
                                 value={name || ""}
                                 onSave={handleSave}
                                 loading={loading}
                                 dict={dict}
                              />
                           </div>
                        )}
                     </div>

                     {/* Restaurant Description */}
                     <div className="relative group">
                        <p className="text-sm md:text-base text-[color-mix(in_srgb,var(--text-color)_80%,transparent)] leading-relaxed font-medium max-w-md mx-auto tracking-wide drop-shadow-sm">
                           {desc ||
                              dict.upper_section
                                 .restaurant_description_placeholder}
                        </p>

                        {isSuperAdmin && (
                           <div className="absolute -top-2 -right-2">
                              <TextEditModal
                                 field="desc"
                                 label={getFieldLabel("desc")}
                                 editLabel={getEditLabel("desc")}
                                 value={desc || ""}
                                 onSave={handleSave}
                                 loading={loading}
                                 dict={dict}
                              />
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Enhanced bottom accent */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-transparent via-[var(--utility-color)]/60 to-transparent rounded-t-full" />
               </div>

               {/* Enhanced floating shadow elements */}
               {/* <div className="absolute -inset-2 bg-gradient-to-r from-[var(--utility-color)]/15 via-[var(--utility-color)]/8 to-[var(--utility-color)]/15 rounded-3xl blur-xl -z-10" />
               <div className="absolute -inset-4 bg-[var(--utility-color)]/8 rounded-3xl blur-2xl -z-20 opacity-60" />
               <div className="absolute -inset-6 bg-black/5 rounded-3xl blur-3xl -z-30" /> */}
            </div>
         </div>

         <InfoBar dict={dict} />

         {/* Header Images Management Modal */}
         <HeaderImagesModal
            isOpen={showHeaderImagesModal}
            onClose={() => setShowHeaderImagesModal(false)}
            images={header_images || []}
            onSave={handleHeaderImagesSave}
            loading={loading}
            dict={dict}
         />
      </div>
   );
}

export default UpperSection;
