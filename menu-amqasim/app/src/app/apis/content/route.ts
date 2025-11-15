import Content from "@/models/content";
import { initConnection } from "@/utils/connection";
import { isSuperAdmin } from "@/utils/isSuperAdmin";
import { isAdmin } from "@/utils/isAdmin";
import { Jimp } from "jimp";

// Image compression utility function using JIMP
const compressImage = async (
   base64Image: string,
   maxWidth: number = 1200,
   quality: number = 80
): Promise<string> => {
   try {
      // Remove base64 prefix if present (data:image/jpeg;base64, or similar)
      const base64Data = base64Image.includes(",")
         ? base64Image.split(",")[1]
         : base64Image;

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Data, "base64");

      // Read the image with JIMP
      const image = await Jimp.read(imageBuffer);

      // Get original dimensions
      const { width } = image.bitmap;

      // Resize if the width exceeds maxWidth while maintaining aspect ratio
      if (width > maxWidth) {
         image.resize({ w: maxWidth });
      }

      // Get the compressed buffer as JPEG with quality
      const compressedBuffer = await image.getBuffer("image/jpeg", {
         quality,
      });

      // Convert back to base64
      const compressedBase64 = compressedBuffer.toString("base64");

      // Add back the data URL prefix
      const mimeType = base64Image.includes("data:image/")
         ? base64Image.substring(0, base64Image.indexOf(","))
         : "data:image/jpeg;base64";

      return `${
         mimeType.includes("base64") ? mimeType : mimeType + ";base64"
      },${compressedBase64}`;
   } catch (error) {
      console.error("Image compression failed:", error);
      // Return original image if compression fails
      return base64Image;
   }
};

// Compress array of images
const compressImages = async (
   images: string[],
   maxWidth: number = 1200,
   quality: number = 80
): Promise<string[]> => {
   const compressedImages = await Promise.all(
      images.map((image) => compressImage(image, maxWidth, quality))
   );
   return compressedImages;
};

// Ensure default content exists for the specified language
const ensureDefaultContent = async (lang_abbr: "en" | "ar" = "ar") => {
   try {
      const existingContent = await Content.findOne({ lang_abbr });
      if (!existingContent) {
         await new Content({ lang_abbr }).save(); // Will use default values from schema
         console.log(
            `Default content created successfully for language: ${lang_abbr}`
         );
      }
   } catch (error) {
      console.error("Failed to ensure default content:", error);
   }
};

export async function PUT(request: Request) {
   await initConnection();

   // Allow both super admins and regular admins to manage content
   const isSuperAdminUser = await isSuperAdmin(request);
   const isAdminUser = await isAdmin(request);

   if (!isSuperAdminUser && !isAdminUser) {
      return Response.json(
         { msg: "UNAUTHORIZED", isOk: false, data: null },
         { status: 401 }
      );
   }

   const { name, desc, logo, header_images, bg_image, info_bar, lang_abbr } =
      await request.json();

   // Validate lang_abbr if provided
   if (lang_abbr && !["en", "ar"].includes(lang_abbr)) {
      return Response.json(
         { msg: "INVALID_LANG_ABBR", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Compress images before validation and saving
   let compressedLogo = logo;
   let compressedHeaderImages = header_images;
   let compressedBgImage = bg_image;

   try {
      // Compress logo if provided (smaller max width for logos)
      if (logo && typeof logo === "string" && logo.length > 0) {
         compressedLogo = await compressImage(logo, 400, 85);
      }

      // Compress header images if provided
      if (header_images && Array.isArray(header_images)) {
         const validImages = header_images.filter(
            (img) => typeof img === "string" && img.length > 0
         );
         if (validImages.length > 0) {
            compressedHeaderImages = await compressImages(validImages, 800, 80);
         }
      }

      // Compress background image if provided
      if (bg_image && typeof bg_image === "string" && bg_image.length > 0) {
         compressedBgImage = await compressImage(bg_image, 1200, 80);
      }
   } catch (error) {
      console.error("Image compression error:", error);
      return Response.json(
         { msg: "IMAGE_COMPRESSION_FAILED", isOk: false, data: null },
         { status: 500 }
      );
   }

   // Validate image sizes if provided (using compressed images)
   if (compressedLogo) {
      // Calculate size in bytes (base64 encoded data is ~33% larger than actual size)
      const logoSizeInBytes = (compressedLogo.length * 3) / 4;
      const logoSizeInMB = logoSizeInBytes / (1024 * 1024);
      if (logoSizeInMB > 1) {
         return Response.json(
            { msg: "LOGO_SIZE_EXCEEDS_1MB", isOk: false, data: null },
            { status: 400 }
         );
      }
   }

   if (compressedHeaderImages && Array.isArray(compressedHeaderImages)) {
      for (const image of compressedHeaderImages) {
         if (typeof image === "string" && image.length > 0) {
            // Calculate size in bytes (base64 encoded data is ~33% larger than actual size)
            const headerImageSizeInBytes = (image.length * 3) / 4;
            const headerImageSizeInMB = headerImageSizeInBytes / (1024 * 1024);
            if (headerImageSizeInMB > 4) {
               return Response.json(
                  {
                     msg: "HEADER_IMAGE_SIZE_EXCEEDS_4MB",
                     isOk: false,
                     data: null,
                  },
                  { status: 400 }
               );
            }
         }
      }
   }

   if (compressedBgImage) {
      // Calculate size in bytes (base64 encoded data is ~33% larger than actual size)
      const bgImageSizeInBytes = (compressedBgImage.length * 3) / 4;
      const bgImageSizeInMB = bgImageSizeInBytes / (1024 * 1024);
      if (bgImageSizeInMB > 4) {
         return Response.json(
            { msg: "BG_IMAGE_SIZE_EXCEEDS_4MB", isOk: false, data: null },
            { status: 400 }
         );
      }
   }

   // Validate at least one field is provided for update
   if (
      !name &&
      !desc &&
      !compressedLogo &&
      !compressedHeaderImages &&
      compressedBgImage === undefined &&
      !info_bar &&
      !lang_abbr
   ) {
      return Response.json(
         { msg: "AT_LEAST_ONE_FIELD_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Ensure default content exists for the language
   const targetLang = (lang_abbr as "en" | "ar") || "ar";
   await ensureDefaultContent(targetLang);

   // Find existing content
   const existingContent = await Content.findOne({ lang_abbr: targetLang });
   if (!existingContent) {
      return Response.json(
         { msg: "CONTENT_NOT_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   // Create update object with proper nested field merging (using compressed images)
   const updateFields: Record<string, string | string[]> = {};

   if (name) updateFields.name = name;
   if (desc) updateFields.desc = desc;
   if (compressedLogo) updateFields.logo = compressedLogo;
   if (compressedHeaderImages)
      updateFields.header_images = compressedHeaderImages;
   if (compressedBgImage !== undefined)
      updateFields.bg_image = compressedBgImage; // Allow null to clear the field
   if (lang_abbr) updateFields.lang_abbr = lang_abbr;

   // Handle info_bar with dot notation to merge instead of replace
   if (info_bar) {
      if (info_bar.locations) {
         updateFields["info_bar.locations"] = info_bar.locations;
      }
      if (info_bar.info) updateFields["info_bar.info"] = info_bar.info;
      if (info_bar.review) {
         if (info_bar.review.google_map_link) {
            updateFields["info_bar.review.google_map_link"] =
               info_bar.review.google_map_link;
         }
      }
      if (info_bar.contact) {
         if (info_bar.contact.phone_number) {
            updateFields["info_bar.contact.phone_number"] =
               info_bar.contact.phone_number;
         }
         if (info_bar.contact.whatsapp_number) {
            updateFields["info_bar.contact.whatsapp_number"] =
               info_bar.contact.whatsapp_number;
         }
         if (info_bar.contact.email) {
            updateFields["info_bar.contact.email"] = info_bar.contact.email;
         }
      }
      if (info_bar.social_links) {
         if (info_bar.social_links.facebook) {
            updateFields["info_bar.social_links.facebook"] =
               info_bar.social_links.facebook;
         }
         if (info_bar.social_links.twitter) {
            updateFields["info_bar.social_links.twitter"] =
               info_bar.social_links.twitter;
         }
         if (info_bar.social_links.instagram) {
            updateFields["info_bar.social_links.instagram"] =
               info_bar.social_links.instagram;
         }
         if (info_bar.social_links.linkedin) {
            updateFields["info_bar.social_links.linkedin"] =
               info_bar.social_links.linkedin;
         }
         if (info_bar.social_links.youtube) {
            updateFields["info_bar.social_links.youtube"] =
               info_bar.social_links.youtube;
         }
      }
      if (info_bar.share_link)
         updateFields["info_bar.share_link"] = info_bar.share_link;
      if (info_bar.allergies)
         updateFields["info_bar.allergies"] = info_bar.allergies;
   }

   const updatedContent = await Content.findByIdAndUpdate(
      existingContent._id,
      updateFields,
      { new: true }
   );

   if (!updatedContent) {
      return Response.json(
         { msg: "FAILED_TO_UPDATE_CONTENT", isOk: false, data: null },
         { status: 500 }
      );
   }

   return Response.json({
      msg: "CONTENT_UPDATED",
      isOk: true,
      data: {
         content: {
            _id: updatedContent._id,
            name: updatedContent.name,
            desc: updatedContent.desc,
            logo: updatedContent.logo,
            header_images: updatedContent.header_images,
            bg_image: updatedContent.bg_image,
            info_bar: updatedContent.info_bar,
            lang_abbr: updatedContent.lang_abbr,
            createdAt: updatedContent.createdAt,
            updatedAt: updatedContent.updatedAt,
         },
      },
   });
}

export async function GET(request: Request) {
   await initConnection();

   const { searchParams } = new URL(request.url);
   const lang_abbr = searchParams.get("lang_abbr");

   // Validate lang_abbr if provided
   if (lang_abbr && !["en", "ar"].includes(lang_abbr)) {
      return Response.json(
         { msg: "INVALID_LANG_ABBR", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Use default "ar" if no lang_abbr provided
   const targetLang = (lang_abbr as "en" | "ar") || "ar";

   // Ensure default content exists for the language
   await ensureDefaultContent(targetLang);

   const content = await Content.findOne({ lang_abbr: targetLang });

   if (!content) {
      return Response.json(
         { msg: "CONTENT_NOT_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   return Response.json({
      msg: "CONTENT_FETCHED",
      isOk: true,
      data: { content },
   });
}
