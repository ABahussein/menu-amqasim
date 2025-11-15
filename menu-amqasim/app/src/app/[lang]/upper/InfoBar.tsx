"use client";

import {
   MapPin,
   Phone,
   Mail,
   MessageCircle,
   Star,
   Info,
   Facebook,
   Twitter,
   Instagram,
   Linkedin,
   Youtube,
   Share2,
   ExternalLink,
   AlertTriangle,
   Edit2,
   Plus,
   Trash2,
   Fish,
   Egg,
   Wheat,
   Milk,
   Nut,
   Shell,
   Flower2,
   FlaskConical,
   Carrot,
   Bean,
   Sprout,
} from "lucide-react";
import useContentStore from "@/store/useContentStore";
import useUserStore, { UserRole } from "@/store/useUserStore";
import { useState } from "react";
import call from "@/utils/call";
import useLangStore from "@/store/useLangStore";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { ALLERGIES_EN, ALLERGIES_AR } from "@/models/content";

interface InfoBarProps {
   dict: {
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
      upper_section: {
         save_changes: string;
         cancel: string;
      };
   };
}

function InfoBar({ dict }: InfoBarProps) {
   const { info_bar, setContent, name, desc, logo, header_images, lang_abbr } =
      useContentStore();
   const { role, token } = useUserStore();
   const { lang } = useLangStore();
   const [loading, setLoading] = useState(false);

   const isSuperAdmin = role === UserRole.SUPERADMIN;

   const [editModal, setEditModal] = useState<string | null>(null);
   const [editValue, setEditValue] = useState("");
   const [contactModal, setContactModal] = useState(false);
   const [socialModal, setSocialModal] = useState(false);
   const [locationsModal, setLocationsModal] = useState(false);
   const [allergiesModal, setAllergiesModal] = useState(false);
   const [allergiesInfoModal, setAllergiesInfoModal] = useState(false);
   const [infoModal, setInfoModal] = useState(false);
   const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
   const [newLocation, setNewLocation] = useState("");
   const [editingLocation, setEditingLocation] = useState<{
      id: string;
      place: string;
   } | null>(null);

   const handleSave = async (field: string, value: string) => {
      setLoading(true);
      try {
         const updateData: Record<string, string | object> = {
            info_bar: {},
            lang_abbr: lang || "ar",
         };

         // Handle nested field updates
         if (field === "location.place") {
            updateData.info_bar = { location: { place: value } };
         } else if (field === "info") {
            updateData.info_bar = { info: value };
         } else if (field === "review.google_map_link") {
            updateData.info_bar = { review: { google_map_link: value } };
         } else if (field.startsWith("contact.")) {
            const contactField = field.split(".")[1];
            updateData.info_bar = { contact: { [contactField]: value } };
         } else if (field.startsWith("social_links.")) {
            const socialField = field.split(".")[1];
            updateData.info_bar = { social_links: { [socialField]: value } };
         } else if (field === "share_link") {
            updateData.info_bar = { share_link: value };
         }

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
               name,
               desc,
               logo,
               header_images,
               null,
               data.content.info_bar,
               lang_abbr
            );
         }
      } catch (error) {
         console.error("Error updating content:", error);
      } finally {
         setLoading(false);
         setEditModal(null);
      }
   };

   const openEditModal = (field: string, currentValue: string) => {
      setEditModal(field);
      setEditValue(currentValue || "");
   };

   // Location management functions
   const addLocation = async () => {
      if (!newLocation.trim()) return;

      setLoading(true);
      try {
         // Generate a unique ID for the new location
         const locationId = Date.now().toString();
         const currentLocations = info_bar?.locations || [];
         const newLocationObj = { place: newLocation.trim(), id: locationId };
         const updatedLocations = [...currentLocations, newLocationObj];

         const updateData = {
            info_bar: { locations: updatedLocations },
            lang_abbr: lang_abbr,
         };

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
            console.error("Failed to add location:", msg);
         } else if (data) {
            // Update the store with the new content
            setContent(
               name,
               desc,
               logo,
               header_images,
               null,
               data.content.info_bar,
               lang_abbr
            );
            setNewLocation("");
         }
      } catch (error) {
         console.error("Error adding location:", error);
      } finally {
         setLoading(false);
      }
   };

   const updateLocation = async (locationId: string, place: string) => {
      if (!place.trim()) return;

      setLoading(true);
      try {
         const currentLocations = info_bar?.locations || [];
         const updatedLocations = currentLocations.map((loc) =>
            loc.id === locationId ? { ...loc, place: place.trim() } : loc
         );

         const updateData = {
            info_bar: { locations: updatedLocations },
            lang_abbr: lang_abbr,
         };

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
            console.error("Failed to update location:", msg);
         } else if (data) {
            // Update the store with the new content
            setContent(
               name,
               desc,
               logo,
               header_images,
               null,
               data.content.info_bar,
               lang_abbr
            );
            setEditingLocation(null);
         }
      } catch (error) {
         console.error("Error updating location:", error);
      } finally {
         setLoading(false);
      }
   };

   const deleteLocation = async (locationId: string) => {
      setLoading(true);
      try {
         const currentLocations = info_bar?.locations || [];
         const updatedLocations = currentLocations.filter(
            (loc) => loc.id !== locationId
         );

         const updateData = {
            info_bar: { locations: updatedLocations },
            lang_abbr: lang_abbr,
         };

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
            console.error("Failed to delete location:", msg);
         } else if (data) {
            // Update the store with the new content
            setContent(
               name,
               desc,
               logo,
               header_images,
               null,
               data.content.info_bar,
               lang_abbr
            );
         }
      } catch (error) {
         console.error("Error deleting location:", error);
      } finally {
         setLoading(false);
      }
   };

   // Allergies management functions
   const openAllergiesModal = () => {
      setSelectedAllergies(info_bar?.allergies ? [...info_bar.allergies] : []);
      setAllergiesModal(true);
   };

   const handleAllergyToggle = (allergy: string) => {
      setSelectedAllergies((prev) =>
         prev.includes(allergy)
            ? prev.filter((a) => a !== allergy)
            : [...prev, allergy]
      );
   };

   const saveAllergies = async () => {
      setLoading(true);
      try {
         const updateData = {
            info_bar: { allergies: selectedAllergies },
            lang_abbr: lang_abbr,
         };

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
            console.error("Failed to update allergies:", msg);
         } else if (data) {
            // Update the store with the new content
            setContent(
               name,
               desc,
               logo,
               header_images,
               null,
               data.content.info_bar,
               lang_abbr
            );
            setAllergiesModal(false);
         }
      } catch (error) {
         console.error("Error updating allergies:", error);
      } finally {
         setLoading(false);
      }
   };

   // Get appropriate allergies enum based on language
   const getAllergiesEnum = () => {
      return lang === "en" ? ALLERGIES_EN : ALLERGIES_AR;
   };

   // Get description for a specific allergy
   const getAllergyDescription = (allergy: string) => {
      return dict.info_bar.allergy_descriptions[allergy] || allergy;
   };

   // Get appropriate icon for each allergy type
   const getAllergyIcon = (allergy: string) => {
      const allergyUpper = allergy.toUpperCase();

      // English allergy mappings
      if (allergyUpper.includes("FISH") || allergy === "سمك") {
         return Fish;
      }
      if (allergyUpper.includes("EGG") || allergy === "بيض") {
         return Egg;
      }
      if (
         allergyUpper.includes("GLUTEN") ||
         allergyUpper.includes("WHEAT") ||
         allergy === "جلوتين"
      ) {
         return Wheat;
      }
      if (
         allergyUpper.includes("MILK") ||
         allergyUpper.includes("DAIRY") ||
         allergy === "حليب"
      ) {
         return Milk;
      }
      if (
         allergyUpper.includes("NUTS") ||
         allergyUpper.includes("NUT") ||
         allergy === "مكسرات"
      ) {
         return Nut;
      }
      if (
         allergyUpper.includes("CRUSTACEAN") ||
         allergyUpper.includes("SHELLFISH") ||
         allergy === "قشريات"
      ) {
         return Shell;
      }
      if (allergyUpper.includes("MUSTARD") || allergy === "خردل") {
         return Flower2;
      }
      if (allergyUpper.includes("MOLLUSC") || allergy === "رخويات") {
         return Shell;
      }
      if (allergyUpper.includes("PEANUT") || allergy === "فول سوداني") {
         return Nut;
      }
      if (
         allergyUpper.includes("SULFITE") ||
         allergyUpper.includes("كبريتات")
      ) {
         return FlaskConical;
      }
      if (allergyUpper.includes("CELERY") || allergy === "كرفس") {
         return Carrot;
      }
      if (
         allergyUpper.includes("SOYBEAN") ||
         allergyUpper.includes("SOY") ||
         allergy === "فول الصويا"
      ) {
         return Bean;
      }
      if (allergyUpper.includes("LUPIN") || allergy === "لوبين") {
         return Sprout;
      }

      // Default icon for unknown allergies
      return AlertTriangle;
   };

   return (
      <>
         <style jsx>{`
            .info-cards-wrapper {
               max-width: 1200px;
               margin: 0 auto;
               position: relative;
            }

            .info-cards-scroll {
               overflow-x: auto;
               scroll-behavior: smooth;
               -webkit-overflow-scrolling: touch;
               padding: 1.1rem 0;
               padding-top: 0.5rem;
            }

            .info-cards-container {
               display: flex;
               gap: 0.5rem;
               min-width: min-content;
               justify-content: center;
               align-items: center;
            }

            /* Center cards when they fit in one view */
            @media (min-width: 769px) {
               .info-cards-container {
                  justify-content: center;
               }
            }

            /* Mobile adjustments */
            @media (max-width: 768px) {
               .info-bar {
                  padding: 0;
                  padding-top: 1rem;
               }

               .info-cards-container {
                  gap: 0.375rem;
                  justify-content: flex-start;
               }
            }

            /* Scrollbar styling */
            .info-cards-scroll::-webkit-scrollbar {
               height: 6px;
            }

            .info-cards-scroll::-webkit-scrollbar-track {
               background: rgba(0, 0, 0, 0.1);
               border-radius: 3px;
            }

            .info-cards-scroll::-webkit-scrollbar-thumb {
               background: var(--utility-color);
               border-radius: 3px;
            }

            .info-cards-scroll::-webkit-scrollbar-thumb:hover {
               background: var(--text-color);
            }

            /* Info card base styles */
            .info-card {
               flex-shrink: 0;
            }
         `}</style>
         <div className="info-bar">
            <div className="info-cards-wrapper">
               <div className="info-cards-scroll">
                  <div className="info-cards-container">
                     {/* Locations Card */}
                     {((info_bar?.locations && info_bar.locations.length > 0) ||
                        isSuperAdmin) && (
                        <div
                           className="info-card w-20 h-20 bg-white/95 backdrop-blur-xl rounded-2xl relative overflow-hidden shadow-lg shadow-[var(--utility-color)]/10 border border-white/50 cursor-pointer hover:shadow-[var(--utility-color)]/20 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center"
                           onClick={() => setLocationsModal(true)}
                        >
                           {/* Edit button - absolute positioned */}
                           {isSuperAdmin && (
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setLocationsModal(true);
                                 }}
                                 className="absolute top-1 right-1 p-1.5 text-[var(--utility-color)] hover:bg-white/90 rounded-full transition-all duration-200 shadow-sm hover:shadow-md bg-white/70 backdrop-blur-sm z-10"
                              >
                                 <Edit2 size={12} />
                              </button>
                           )}

                           {/* Icon */}
                           <div className="p-1.5 bg-[var(--utility-color)]/10 rounded-lg mb-1">
                              <MapPin className="w-5 h-5 text-[var(--utility-color)]" />
                           </div>

                           {/* Title */}
                           <h3 className="text-[10px] font-semibold text-[var(--text-color)] text-center px-1 leading-tight">
                              {dict.info_bar.locations}
                           </h3>
                        </div>
                     )}

                     {/* Contact Us Card */}
                     {(info_bar?.contact?.phone_number ||
                        info_bar?.contact?.whatsapp_number ||
                        info_bar?.contact?.email ||
                        isSuperAdmin) && (
                        <div
                           className="info-card w-20 h-20 bg-white/95 backdrop-blur-xl rounded-2xl relative overflow-hidden shadow-lg shadow-[var(--utility-color)]/10 border border-white/50 cursor-pointer hover:shadow-[var(--utility-color)]/20 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center"
                           onClick={() => setContactModal(true)}
                        >
                           {/* Edit button - absolute positioned */}
                           {isSuperAdmin && (
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setContactModal(true);
                                 }}
                                 className="absolute top-1 right-1 p-1.5 text-[var(--utility-color)] hover:bg-white/90 rounded-full transition-all duration-200 shadow-sm hover:shadow-md bg-white/70 backdrop-blur-sm z-10"
                              >
                                 <Edit2 size={12} />
                              </button>
                           )}

                           {/* Icon */}
                           <div className="p-1.5 bg-[var(--utility-color)]/10 rounded-lg mb-1">
                              <Phone className="w-5 h-5 text-[var(--utility-color)]" />
                           </div>

                           {/* Title */}
                           <h3 className="text-[10px] font-semibold text-[var(--text-color)] text-center px-1 leading-tight">
                              {dict.info_bar.contact_us}
                           </h3>
                        </div>
                     )}

                     {/* Reviews Card */}
                     {(info_bar?.review?.google_map_link || isSuperAdmin) && (
                        <div
                           className="info-card w-20 h-20 bg-white/95 backdrop-blur-xl rounded-2xl relative overflow-hidden shadow-lg shadow-[var(--utility-color)]/10 border border-white/50 cursor-pointer hover:shadow-[var(--utility-color)]/20 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center"
                           onClick={() => {
                              if (info_bar?.review?.google_map_link) {
                                 window.open(
                                    info_bar.review.google_map_link,
                                    "_blank",
                                    "noopener,noreferrer"
                                 );
                              }
                           }}
                        >
                           {/* Edit button - absolute positioned */}
                           {isSuperAdmin && (
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(
                                       "review.google_map_link",
                                       info_bar?.review?.google_map_link || ""
                                    );
                                 }}
                                 className="absolute top-1 right-1 p-1.5 text-[var(--utility-color)] hover:bg-white/90 rounded-full transition-all duration-200 shadow-sm hover:shadow-md bg-white/70 backdrop-blur-sm z-10"
                              >
                                 {info_bar?.review?.google_map_link ? (
                                    <Edit2 size={12} />
                                 ) : (
                                    <Plus size={12} />
                                 )}
                              </button>
                           )}

                           {/* Icon */}
                           <div className="p-1.5 bg-[var(--utility-color)]/10 rounded-lg mb-1">
                              <Star className="w-5 h-5 text-[var(--utility-color)]" />
                           </div>

                           {/* Title */}
                           <h3 className="text-[10px] font-semibold text-[var(--text-color)] text-center px-1 leading-tight">
                              {dict.info_bar.reviews}
                           </h3>
                        </div>
                     )}
                     {/* Information Card */}
                     {(info_bar?.info || isSuperAdmin) && (
                        <div
                           className="info-card w-20 h-20 bg-white/95 backdrop-blur-xl rounded-2xl relative overflow-hidden shadow-lg shadow-[var(--utility-color)]/10 border border-white/50 cursor-pointer hover:shadow-[var(--utility-color)]/20 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center"
                           onClick={() => setInfoModal(true)}
                        >
                           {/* Edit button - absolute positioned */}
                           {isSuperAdmin && (
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal("info", info_bar?.info || "");
                                 }}
                                 className="absolute top-1 right-1 p-1.5 text-[var(--utility-color)] hover:bg-white/90 rounded-full transition-all duration-200 shadow-sm hover:shadow-md bg-white/70 backdrop-blur-sm z-10"
                              >
                                 {info_bar?.info ? (
                                    <Edit2 size={12} />
                                 ) : (
                                    <Plus size={12} />
                                 )}
                              </button>
                           )}

                           {/* Icon */}
                           <div className="p-1.5 bg-[var(--utility-color)]/10 rounded-lg mb-1">
                              <Info className="w-5 h-5 text-[var(--utility-color)]" />
                           </div>

                           {/* Title */}
                           <h3 className="text-[10px] font-semibold text-[var(--text-color)] text-center px-1 leading-tight">
                              {dict.info_bar.information}
                           </h3>
                        </div>
                     )}

                     {/* Social Media Card */}
                     {(info_bar?.social_links?.facebook ||
                        info_bar?.social_links?.twitter ||
                        info_bar?.social_links?.instagram ||
                        info_bar?.social_links?.linkedin ||
                        info_bar?.social_links?.youtube ||
                        isSuperAdmin) && (
                        <div
                           className="info-card w-20 h-20 bg-white/95 backdrop-blur-xl rounded-2xl relative overflow-hidden shadow-lg shadow-[var(--utility-color)]/10 border border-white/50 cursor-pointer hover:shadow-[var(--utility-color)]/20 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center"
                           onClick={() => setSocialModal(true)}
                        >
                           {/* Edit button - absolute positioned */}
                           {isSuperAdmin && (
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setSocialModal(true);
                                 }}
                                 className="absolute top-1 right-1 p-1.5 text-[var(--utility-color)] hover:bg-white/90 rounded-full transition-all duration-200 shadow-sm hover:shadow-md bg-white/70 backdrop-blur-sm z-10"
                              >
                                 <Edit2 size={12} />
                              </button>
                           )}

                           {/* Icon */}
                           <div className="p-1.5 bg-[var(--utility-color)]/10 rounded-lg mb-1">
                              <Share2 className="w-5 h-5 text-[var(--utility-color)]" />
                           </div>

                           {/* Title */}
                           <h3 className="text-[10px] font-semibold text-[var(--text-color)] text-center px-1 leading-tight">
                              {dict.info_bar.social_media}
                           </h3>
                        </div>
                     )}

                     {/* Share Link Card */}
                     {(info_bar?.share_link || isSuperAdmin) && (
                        <div
                           className="info-card w-20 h-20 bg-white/95 backdrop-blur-xl rounded-2xl relative overflow-hidden shadow-lg shadow-[var(--utility-color)]/10 border border-white/50 cursor-pointer hover:shadow-[var(--utility-color)]/20 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center"
                           onClick={() => {
                              if (info_bar?.share_link) {
                                 window.open(
                                    info_bar.share_link,
                                    "_blank",
                                    "noopener,noreferrer"
                                 );
                              }
                           }}
                        >
                           {/* Edit button - absolute positioned */}
                           {isSuperAdmin && (
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(
                                       "share_link",
                                       info_bar?.share_link || ""
                                    );
                                 }}
                                 className="absolute top-1 right-1 p-1.5 text-[var(--utility-color)] hover:bg-white/90 rounded-full transition-all duration-200 shadow-sm hover:shadow-md bg-white/70 backdrop-blur-sm z-10"
                              >
                                 {info_bar?.share_link ? (
                                    <Edit2 size={12} />
                                 ) : (
                                    <Plus size={12} />
                                 )}
                              </button>
                           )}

                           {/* Icon */}
                           <div className="p-1.5 bg-[var(--utility-color)]/10 rounded-lg mb-1">
                              <ExternalLink className="w-5 h-5 text-[var(--utility-color)]" />
                           </div>

                           {/* Title */}
                           <h3 className="text-[10px] font-semibold text-[var(--text-color)] text-center px-1 leading-tight">
                              {dict.info_bar.share_link}
                           </h3>
                        </div>
                     )}

                     {/* Allergies Information */}
                     {((info_bar?.allergies?.length ?? 0) > 0 ||
                        isSuperAdmin) && (
                        <div
                           className="info-card w-20 h-20 bg-white/95 backdrop-blur-xl rounded-2xl relative overflow-hidden shadow-lg shadow-[var(--utility-color)]/10 border border-white/50 cursor-pointer hover:shadow-[var(--utility-color)]/20 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center"
                           onClick={() =>
                              isSuperAdmin
                                 ? openAllergiesModal()
                                 : info_bar?.allergies &&
                                   info_bar.allergies.length > 0
                                 ? setAllergiesInfoModal(true)
                                 : undefined
                           }
                        >
                           {/* Edit button - absolute positioned */}
                           {isSuperAdmin && (
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    openAllergiesModal();
                                 }}
                                 className="absolute top-1 right-1 p-1.5 text-[var(--utility-color)] hover:bg-white/90 rounded-full transition-all duration-200 shadow-sm hover:shadow-md bg-white/70 backdrop-blur-sm z-10"
                              >
                                 {info_bar?.allergies &&
                                 info_bar.allergies.length > 0 ? (
                                    <Edit2 size={12} />
                                 ) : (
                                    <Plus size={12} />
                                 )}
                              </button>
                           )}

                           {/* Icon */}
                           <div className="p-1.5 bg-[var(--utility-color)]/10 rounded-lg mb-1">
                              <AlertTriangle className="w-5 h-5 text-[var(--utility-color)]" />
                           </div>

                           {/* Title */}
                           <h3 className="text-[10px] font-semibold text-[var(--text-color)] text-center px-1 leading-tight">
                              {dict.info_bar.allergies}
                           </h3>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Contact Us Modal */}
         <Modal
            trigger={<div />}
            isOpen={contactModal}
            onClose={() => setContactModal(false)}
            title={dict.info_bar.contact_us}
         >
            <div className="space-y-6">
               {/* Phone Section */}
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-[var(--utility-color)]" />
                        <h4 className="font-medium text-[var(--text-color)]">
                           {dict.info_bar.phone}
                        </h4>
                     </div>
                     {isSuperAdmin && (
                        <button
                           onClick={() => {
                              setContactModal(false);
                              openEditModal(
                                 "contact.phone_number",
                                 info_bar?.contact?.phone_number || ""
                              );
                           }}
                           className="p-1 text-[var(--utility-color)] hover:bg-[var(--utility-color)]/10 rounded transition-colors"
                        >
                           <Edit2 size={12} />
                        </button>
                     )}
                  </div>
                  {info_bar?.contact?.phone_number ? (
                     <a
                        href={`tel:${info_bar.contact.phone_number}`}
                        className="block text-sm text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] hover:text-[var(--utility-color)] transition-colors pl-6"
                     >
                        {info_bar.contact.phone_number}
                     </a>
                  ) : (
                     <p className="text-sm text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] italic pl-6">
                        {dict.info_bar.no_phone}
                     </p>
                  )}
               </div>

               {/* WhatsApp Section */}
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-[var(--text-color)]">
                           {dict.info_bar.whatsapp}
                        </h4>
                     </div>
                     {isSuperAdmin && (
                        <button
                           onClick={() => {
                              setContactModal(false);
                              openEditModal(
                                 "contact.whatsapp_number",
                                 info_bar?.contact?.whatsapp_number || ""
                              );
                           }}
                           className="p-1 text-green-600 hover:bg-green-500/10 rounded transition-colors"
                        >
                           <Edit2 size={12} />
                        </button>
                     )}
                  </div>
                  {info_bar?.contact?.whatsapp_number ? (
                     <a
                        href={`https://wa.me/${info_bar.contact.whatsapp_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] hover:text-green-600 transition-colors pl-6"
                     >
                        {info_bar.contact.whatsapp_number}
                     </a>
                  ) : (
                     <p className="text-sm text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] italic pl-6">
                        {dict.info_bar.no_whatsapp}
                     </p>
                  )}
               </div>

               {/* Email Section */}
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium text-[var(--text-color)]">
                           {dict.info_bar.email}
                        </h4>
                     </div>
                     {isSuperAdmin && (
                        <button
                           onClick={() => {
                              setContactModal(false);
                              openEditModal(
                                 "contact.email",
                                 info_bar?.contact?.email || ""
                              );
                           }}
                           className="p-1 text-blue-600 hover:bg-blue-500/10 rounded transition-colors"
                        >
                           <Edit2 size={12} />
                        </button>
                     )}
                  </div>
                  {info_bar?.contact?.email ? (
                     <a
                        href={`mailto:${info_bar.contact.email}`}
                        className="block text-sm text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] hover:text-blue-600 transition-colors pl-6"
                     >
                        {info_bar.contact.email}
                     </a>
                  ) : (
                     <p className="text-sm text-[color-mix(in_srgb,var(--text-color)_50%,transparent)] italic pl-6">
                        {dict.info_bar.no_email}
                     </p>
                  )}
               </div>
            </div>
         </Modal>

         {/* Edit Modal */}
         {editModal && (
            <Modal
               trigger={<div />}
               isOpen={!!editModal}
               onClose={() => setEditModal(null)}
               title={
                  editModal === "location.place"
                     ? dict.info_bar.edit_location
                     : editModal === "contact.phone_number"
                     ? dict.info_bar.edit_phone
                     : editModal === "contact.whatsapp_number"
                     ? dict.info_bar.edit_whatsapp
                     : editModal === "contact.email"
                     ? dict.info_bar.edit_email
                     : editModal === "review.google_map_link"
                     ? dict.info_bar.edit_reviews
                     : editModal === "info"
                     ? dict.info_bar.edit_information
                     : editModal === "social_links.facebook"
                     ? dict.info_bar.edit_facebook
                     : editModal === "social_links.twitter"
                     ? dict.info_bar.edit_twitter
                     : editModal === "social_links.instagram"
                     ? dict.info_bar.edit_instagram
                     : editModal === "social_links.linkedin"
                     ? dict.info_bar.edit_linkedin
                     : editModal === "social_links.youtube"
                     ? dict.info_bar.edit_youtube
                     : editModal === "share_link"
                     ? dict.info_bar.edit_share_link
                     : "Edit Field"
               }
            >
               <div className="space-y-4">
                  <Field
                     label={
                        editModal === "location.place"
                           ? dict.info_bar.locations
                           : editModal === "contact.phone_number"
                           ? dict.info_bar.phone
                           : editModal === "contact.whatsapp_number"
                           ? dict.info_bar.whatsapp
                           : editModal === "contact.email"
                           ? dict.info_bar.email
                           : editModal === "review.google_map_link"
                           ? dict.info_bar.reviews
                           : editModal === "info"
                           ? dict.info_bar.information
                           : editModal === "social_links.facebook"
                           ? dict.info_bar.facebook
                           : editModal === "social_links.twitter"
                           ? dict.info_bar.twitter
                           : editModal === "social_links.instagram"
                           ? dict.info_bar.instagram
                           : editModal === "social_links.linkedin"
                           ? dict.info_bar.linkedin
                           : editModal === "social_links.youtube"
                           ? dict.info_bar.youtube
                           : editModal === "share_link"
                           ? dict.info_bar.share_link
                           : "Field"
                     }
                     value={editValue}
                     onChange={(e) => setEditValue(e.target.value)}
                     type={
                        editModal?.includes("email")
                           ? "email"
                           : editModal?.includes("phone") ||
                             editModal?.includes("whatsapp")
                           ? "tel"
                           : editModal?.includes("link")
                           ? "url"
                           : "text"
                     }
                     placeholder={
                        editModal === "location.place"
                           ? dict.info_bar.location_placeholder
                           : editModal === "contact.phone_number"
                           ? dict.info_bar.phone_placeholder
                           : editModal === "contact.whatsapp_number"
                           ? dict.info_bar.whatsapp_placeholder
                           : editModal === "contact.email"
                           ? dict.info_bar.email_placeholder
                           : editModal === "review.google_map_link"
                           ? dict.info_bar.reviews_placeholder
                           : editModal === "info"
                           ? dict.info_bar.information_placeholder
                           : editModal === "social_links.facebook"
                           ? dict.info_bar.facebook_placeholder
                           : editModal === "social_links.twitter"
                           ? dict.info_bar.twitter_placeholder
                           : editModal === "social_links.instagram"
                           ? dict.info_bar.instagram_placeholder
                           : editModal === "social_links.linkedin"
                           ? dict.info_bar.linkedin_placeholder
                           : editModal === "social_links.youtube"
                           ? dict.info_bar.youtube_placeholder
                           : editModal === "share_link"
                           ? dict.info_bar.share_link_placeholder
                           : "Enter value..."
                     }
                  />

                  <div className="flex justify-end space-x-3 pt-2">
                     <Button
                        variant="outline"
                        onClick={() => setEditModal(null)}
                     >
                        {dict.upper_section.cancel}
                     </Button>
                     <Button
                        onClick={() =>
                           editModal && handleSave(editModal, editValue)
                        }
                        disabled={loading}
                     >
                        {loading
                           ? dict.info_bar.saving
                           : dict.upper_section.save_changes}
                     </Button>
                  </div>
               </div>
            </Modal>
         )}

         {/* Social Media Modal */}
         <Modal
            trigger={<div />}
            isOpen={socialModal}
            onClose={() => setSocialModal(false)}
            title={dict.info_bar.social_media}
         >
            <div className="max-w-md mx-auto space-y-6">
               {/* Facebook */}
               {(isSuperAdmin || info_bar?.social_links?.facebook) && (
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                     <div className="flex-shrink-0 p-2 bg-blue-600/10 rounded-lg">
                        <Facebook className="w-5 h-5 text-blue-600" />
                     </div>
                     <div className="flex-1">
                        <p className="font-medium text-sm">
                           {dict.info_bar.facebook}
                        </p>
                        {info_bar?.social_links?.facebook ? (
                           <div className="flex items-center gap-2 mt-1">
                              <a
                                 href={info_bar.social_links.facebook}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-xs text-blue-600 hover:underline truncate"
                              >
                                 {info_bar.social_links.facebook}
                              </a>
                              {isSuperAdmin && (
                                 <button
                                    onClick={() =>
                                       openEditModal(
                                          "social_links.facebook",
                                          info_bar?.social_links?.facebook || ""
                                       )
                                    }
                                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                 >
                                    <Edit2 size={12} />
                                 </button>
                              )}
                           </div>
                        ) : (
                           isSuperAdmin && (
                              <button
                                 onClick={() =>
                                    openEditModal("social_links.facebook", "")
                                 }
                                 className="text-xs text-gray-500 hover:text-blue-600 mt-1 flex items-center gap-1"
                              >
                                 <Plus size={12} />
                                 {dict.info_bar.add_facebook}
                              </button>
                           )
                        )}
                     </div>
                  </div>
               )}

               {/* Instagram */}
               {(isSuperAdmin || info_bar?.social_links?.instagram) && (
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                     <div className="flex-shrink-0 p-2 bg-pink-500/10 rounded-lg">
                        <Instagram className="w-5 h-5 text-pink-500" />
                     </div>
                     <div className="flex-1">
                        <p className="font-medium text-sm">
                           {dict.info_bar.instagram}
                        </p>
                        {info_bar?.social_links?.instagram ? (
                           <div className="flex items-center gap-2 mt-1">
                              <a
                                 href={info_bar.social_links.instagram}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-xs text-pink-500 hover:underline truncate"
                              >
                                 {info_bar.social_links.instagram}
                              </a>
                              {isSuperAdmin && (
                                 <button
                                    onClick={() =>
                                       openEditModal(
                                          "social_links.instagram",
                                          info_bar?.social_links?.instagram ||
                                             ""
                                       )
                                    }
                                    className="p-1 text-gray-400 hover:text-pink-500 rounded"
                                 >
                                    <Edit2 size={12} />
                                 </button>
                              )}
                           </div>
                        ) : (
                           isSuperAdmin && (
                              <button
                                 onClick={() =>
                                    openEditModal("social_links.instagram", "")
                                 }
                                 className="text-xs text-gray-500 hover:text-pink-500 mt-1 flex items-center gap-1"
                              >
                                 <Plus size={12} />
                                 {dict.info_bar.add_instagram}
                              </button>
                           )
                        )}
                     </div>
                  </div>
               )}

               {/* Twitter */}
               {(isSuperAdmin || info_bar?.social_links?.twitter) && (
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                     <div className="flex-shrink-0 p-2 bg-sky-500/10 rounded-lg">
                        <Twitter className="w-5 h-5 text-sky-500" />
                     </div>
                     <div className="flex-1">
                        <p className="font-medium text-sm">
                           {dict.info_bar.twitter}
                        </p>
                        {info_bar?.social_links?.twitter ? (
                           <div className="flex items-center gap-2 mt-1">
                              <a
                                 href={info_bar.social_links.twitter}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-xs text-sky-500 hover:underline truncate"
                              >
                                 {info_bar.social_links.twitter}
                              </a>
                              {isSuperAdmin && (
                                 <button
                                    onClick={() =>
                                       openEditModal(
                                          "social_links.twitter",
                                          info_bar?.social_links?.twitter || ""
                                       )
                                    }
                                    className="p-1 text-gray-400 hover:text-sky-500 rounded"
                                 >
                                    <Edit2 size={12} />
                                 </button>
                              )}
                           </div>
                        ) : (
                           isSuperAdmin && (
                              <button
                                 onClick={() =>
                                    openEditModal("social_links.twitter", "")
                                 }
                                 className="text-xs text-gray-500 hover:text-sky-500 mt-1 flex items-center gap-1"
                              >
                                 <Plus size={12} />
                                 {dict.info_bar.add_twitter}
                              </button>
                           )
                        )}
                     </div>
                  </div>
               )}

               {/* LinkedIn */}
               {(isSuperAdmin || info_bar?.social_links?.linkedin) && (
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                     <div className="flex-shrink-0 p-2 bg-blue-700/10 rounded-lg">
                        <Linkedin className="w-5 h-5 text-blue-700" />
                     </div>
                     <div className="flex-1">
                        <p className="font-medium text-sm">
                           {dict.info_bar.linkedin}
                        </p>
                        {info_bar?.social_links?.linkedin ? (
                           <div className="flex items-center gap-2 mt-1">
                              <a
                                 href={info_bar.social_links.linkedin}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-xs text-blue-700 hover:underline truncate"
                              >
                                 {info_bar.social_links.linkedin}
                              </a>
                              {isSuperAdmin && (
                                 <button
                                    onClick={() =>
                                       openEditModal(
                                          "social_links.linkedin",
                                          info_bar?.social_links?.linkedin || ""
                                       )
                                    }
                                    className="p-1 text-gray-400 hover:text-blue-700 rounded"
                                 >
                                    <Edit2 size={12} />
                                 </button>
                              )}
                           </div>
                        ) : (
                           isSuperAdmin && (
                              <button
                                 onClick={() =>
                                    openEditModal("social_links.linkedin", "")
                                 }
                                 className="text-xs text-gray-500 hover:text-blue-700 mt-1 flex items-center gap-1"
                              >
                                 <Plus size={12} />
                                 {dict.info_bar.add_linkedin}
                              </button>
                           )
                        )}
                     </div>
                  </div>
               )}

               {/* YouTube */}
               {(isSuperAdmin || info_bar?.social_links?.youtube) && (
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                     <div className="flex-shrink-0 p-2 bg-red-600/10 rounded-lg">
                        <Youtube className="w-5 h-5 text-red-600" />
                     </div>
                     <div className="flex-1">
                        <p className="font-medium text-sm">
                           {dict.info_bar.youtube}
                        </p>
                        {info_bar?.social_links?.youtube ? (
                           <div className="flex items-center gap-2 mt-1">
                              <a
                                 href={info_bar.social_links.youtube}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-xs text-red-600 hover:underline truncate"
                              >
                                 {info_bar.social_links.youtube}
                              </a>
                              {isSuperAdmin && (
                                 <button
                                    onClick={() =>
                                       openEditModal(
                                          "social_links.youtube",
                                          info_bar?.social_links?.youtube || ""
                                       )
                                    }
                                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                                 >
                                    <Edit2 size={12} />
                                 </button>
                              )}
                           </div>
                        ) : (
                           isSuperAdmin && (
                              <button
                                 onClick={() =>
                                    openEditModal("social_links.youtube", "")
                                 }
                                 className="text-xs text-gray-500 hover:text-red-600 mt-1 flex items-center gap-1"
                              >
                                 <Plus size={12} />
                                 {dict.info_bar.add_youtube}
                              </button>
                           )
                        )}
                     </div>
                  </div>
               )}

               {/* Show message when no social links are available for normal users */}
               {!isSuperAdmin &&
                  !info_bar?.social_links?.facebook &&
                  !info_bar?.social_links?.instagram &&
                  !info_bar?.social_links?.twitter &&
                  !info_bar?.social_links?.linkedin &&
                  !info_bar?.social_links?.youtube && (
                     <div className="text-center py-8 text-gray-500">
                        <Share2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium">
                           No social media links available
                        </p>
                        <p className="text-xs mt-1 opacity-75">
                           Check back later for updates
                        </p>
                     </div>
                  )}
            </div>
         </Modal>

         {/* Locations Modal */}
         <Modal
            trigger={<div />}
            isOpen={locationsModal}
            onClose={() => setLocationsModal(false)}
            title={dict.info_bar.locations}
         >
            <div className="max-w-md mx-auto space-y-4">
               {/* Add New Location */}
               {isSuperAdmin && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                     <h4 className="font-medium text-sm mb-3">
                        {dict.info_bar.add_new_location}
                     </h4>
                     <div className="flex gap-2">
                        <input
                           type="text"
                           value={newLocation}
                           onChange={(e) => setNewLocation(e.target.value)}
                           placeholder={
                              dict.info_bar.enter_location_placeholder
                           }
                           className="flex-1 px-3 py-2 border rounded-md text-sm"
                           onKeyPress={(e) =>
                              e.key === "Enter" && addLocation()
                           }
                        />
                        <button
                           onClick={addLocation}
                           disabled={!newLocation.trim() || loading}
                           className="px-3 py-2 bg-[var(--utility-color)] text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Plus size={16} />
                        </button>
                     </div>
                  </div>
               )}

               {/* Existing Locations */}
               <div className="space-y-3">
                  {info_bar?.locations && info_bar.locations.length > 0 ? (
                     info_bar.locations.map((location, index) => (
                        <div
                           key={location.id || index}
                           className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                           <div className="flex-shrink-0 p-2 bg-[var(--utility-color)]/10 rounded-lg">
                              <MapPin className="w-4 h-4 text-[var(--utility-color)]" />
                           </div>
                           <div className="flex-1">
                              {editingLocation?.id === location.id ? (
                                 <div className="flex gap-2">
                                    <input
                                       type="text"
                                       value={editingLocation?.place || ""}
                                       onChange={(e) =>
                                          editingLocation &&
                                          setEditingLocation({
                                             id: editingLocation.id,
                                             place: e.target.value,
                                          })
                                       }
                                       className="flex-1 px-2 py-1 border rounded text-sm"
                                       onKeyPress={(e) => {
                                          if (
                                             e.key === "Enter" &&
                                             editingLocation
                                          ) {
                                             updateLocation(
                                                editingLocation.id,
                                                editingLocation.place
                                             );
                                          }
                                       }}
                                       autoFocus
                                    />
                                    <button
                                       onClick={() =>
                                          editingLocation &&
                                          updateLocation(
                                             editingLocation.id,
                                             editingLocation.place
                                          )
                                       }
                                       disabled={loading}
                                       className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                                    >
                                       {dict.info_bar.save}
                                    </button>
                                    <button
                                       onClick={() => setEditingLocation(null)}
                                       className="px-2 py-1 bg-gray-400 text-white rounded text-xs"
                                    >
                                       {dict.info_bar.cancel}
                                    </button>
                                 </div>
                              ) : (
                                 <div>
                                    <p className="font-medium text-sm">
                                       {location.place}
                                    </p>
                                    {isSuperAdmin && (
                                       <div className="flex gap-2 mt-1">
                                          <button
                                             onClick={() =>
                                                setEditingLocation({
                                                   id:
                                                      location.id ||
                                                      `temp-${index}`,
                                                   place: location.place,
                                                })
                                             }
                                             className="p-1 text-gray-400 hover:text-[var(--utility-color)] rounded"
                                          >
                                             <Edit2 size={12} />
                                          </button>
                                          <button
                                             onClick={() =>
                                                deleteLocation(
                                                   location.id ||
                                                      `temp-${index}`
                                                )
                                             }
                                             disabled={loading}
                                             className="p-1 text-gray-400 hover:text-red-600 rounded"
                                          >
                                             <Trash2 size={12} />
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-6 text-gray-500">
                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                           {dict.info_bar.no_locations_yet}
                        </p>
                        {isSuperAdmin && (
                           <p className="text-xs mt-1">
                              {dict.info_bar.add_first_location}
                           </p>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </Modal>

         {/* Allergies Management Modal */}
         <Modal
            trigger={<div />}
            isOpen={allergiesModal}
            onClose={() => setAllergiesModal(false)}
            title={dict.info_bar.edit_allergies}
         >
            <div className="max-w-md mx-auto">
               <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                     {dict.info_bar.allergies_instruction}
                  </div>

                  {/* Allergies Checkboxes */}
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                     {Object.values(getAllergiesEnum()).map((allergy) => {
                        const AllergyIcon = getAllergyIcon(allergy);
                        return (
                           <label
                              key={allergy}
                              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                           >
                              <input
                                 type="checkbox"
                                 checked={selectedAllergies.includes(allergy)}
                                 onChange={() => handleAllergyToggle(allergy)}
                                 className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                              />
                              <div className="p-1.5 bg-gray-50 rounded-full">
                                 <AllergyIcon className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 flex-1">
                                 {allergy}
                              </span>
                           </label>
                        );
                     })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                     <Button
                        variant="outline"
                        onClick={() => setAllergiesModal(false)}
                     >
                        {dict.upper_section.cancel}
                     </Button>
                     <Button onClick={saveAllergies} disabled={loading}>
                        {loading
                           ? dict.info_bar.saving
                           : dict.upper_section.save_changes}
                     </Button>
                  </div>
               </div>
            </div>
         </Modal>

         {/* Allergies Information Modal (for non-superadmin users) */}
         <Modal
            trigger={<div />}
            isOpen={allergiesInfoModal}
            onClose={() => setAllergiesInfoModal(false)}
            title={dict.info_bar.allergies}
         >
            <div className="max-w-lg mx-auto">
               <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                     {dict.info_bar.allergies_modal_intro}
                  </div>

                  {/* Allergies Details */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                     {info_bar?.allergies?.map((allergy, index) => {
                        const AllergyIcon = getAllergyIcon(allergy);
                        return (
                           <div
                              key={index}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                           >
                              <div className="flex items-start gap-3">
                                 <div className="p-2 bg-gray-50 rounded-full">
                                    <AllergyIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                 </div>
                                 <div className="flex-1">
                                    <div className="font-semibold text-gray-800 text-base mb-2">
                                       {allergy}
                                    </div>
                                    <div className="text-gray-600 text-sm leading-relaxed">
                                       {getAllergyDescription(allergy)}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  {/* Important notice */}
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                     <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-800 text-sm">
                           {dict.info_bar.allergies_important_notice}
                        </span>
                     </div>
                     <p className="text-sm text-red-700">
                        {dict.info_bar.allergies_info}
                     </p>
                  </div>

                  {/* Close Button */}
                  <div className="flex justify-end pt-4 border-t">
                     <Button
                        onClick={() => setAllergiesInfoModal(false)}
                        className="px-6"
                     >
                        {dict.info_bar.close}
                     </Button>
                  </div>
               </div>
            </div>
         </Modal>

         {/* Information Modal */}
         <Modal
            trigger={<div />}
            isOpen={infoModal}
            onClose={() => setInfoModal(false)}
            title={dict.info_bar.information}
         >
            <div className="max-w-2xl mx-auto">
               <div className="space-y-4">
                  {info_bar?.info ? (
                     <div className="prose prose-sm max-w-none">
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                           <div className="flex items-start gap-4">
                              <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                                 <Info className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                 <h3 className="font-semibold text-blue-900 text-lg mb-3">
                                    {dict.info_bar.information}
                                 </h3>
                                 <div className="text-blue-800 text-base leading-relaxed whitespace-pre-wrap">
                                    {info_bar.info}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="text-center py-8">
                        <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 text-lg mb-2">
                           {dict.info_bar.no_information}
                        </p>
                        {isSuperAdmin && (
                           <p className="text-sm text-gray-400">
                              {dict.info_bar.add_information_hint}
                           </p>
                        )}
                     </div>
                  )}

                  {/* Close Button */}
                  <div className="flex justify-end pt-4 border-t">
                     <Button
                        onClick={() => setInfoModal(false)}
                        className="px-6"
                     >
                        {dict.info_bar.close}
                     </Button>
                  </div>
               </div>
            </div>
         </Modal>
      </>
   );
}

export default InfoBar;
