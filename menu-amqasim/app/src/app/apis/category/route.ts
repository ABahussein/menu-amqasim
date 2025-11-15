import Category from "@/models/category";
import Product from "@/models/product";
import { initConnection } from "@/utils/connection";
import { isAdmin } from "@/utils/isAdmin";
import { Jimp } from "jimp";

// Image compression utility function for categories using JIMP
const compressCategoryImage = async (
   base64Image: string,
   maxWidth: number = 200,
   quality: number = 85
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
      console.error("Category image compression failed:", error);
      // Return original image if compression fails
      return base64Image;
   }
};

export async function POST(request: Request) {
   await initConnection();

   const is = await isAdmin(request);

   if (!is) {
      return Response.json(
         { msg: "UNAUTHORIZED", isOk: false, data: null },
         { status: 401 }
      );
   }

   const { name, description, image, lang_abbr } = await request.json();
   if (!name) {
      return Response.json(
         { msg: "NAME_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Validate lang_abbr if provided
   if (lang_abbr && !["en", "ar"].includes(lang_abbr)) {
      return Response.json(
         { msg: "INVALID_LANG_ABBR", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Compress image if provided
   let compressedImage = image;
   if (image && typeof image === "string" && image.length > 0) {
      try {
         compressedImage = await compressCategoryImage(image, 200, 85);
      } catch (error) {
         console.error("Image compression error:", error);
         return Response.json(
            { msg: "IMAGE_COMPRESSION_FAILED", isOk: false, data: null },
            { status: 500 }
         );
      }
   }

   // Validate image size if provided (using compressed image)
   if (compressedImage) {
      // Calculate size in bytes (base64 encoded data is ~33% larger than actual size)
      const imageSizeInBytes = (compressedImage.length * 3) / 4;
      const imageSizeInMB = imageSizeInBytes / (1024 * 1024);
      if (imageSizeInMB > 1) {
         return Response.json(
            { msg: "IMAGE_SIZE_EXCEEDS_1MB", isOk: false, data: null },
            { status: 400 }
         );
      }
   }

   // Check if category with the same name and lang_abbr already exists
   const existingCategory = await Category.findOne({
      name,
      lang_abbr: lang_abbr || "ar",
   });
   if (existingCategory) {
      return Response.json(
         { msg: "CATEGORY_ALREADY_EXISTS", isOk: false, data: null },
         { status: 400 }
      );
   }

   const category = await new Category({
      name,
      description,
      image: compressedImage,
      lang_abbr: lang_abbr || "ar",
   }).save();

   if (!category) {
      return Response.json(
         { msg: "FAILED_TO_CREATE_CATEGORY", isOk: false, data: null },
         { status: 500 }
      );
   }

   return Response.json({
      msg: "CATEGORY_CREATED",
      isOk: true,
      data: {
         category: {
            _id: category._id,
            name: category.name,
            description: category.description,
            image: category.image,
            lang_abbr: category.lang_abbr,
            createdAt: category.createdAt,
         },
      },
   });
}

export async function PUT(request: Request) {
   await initConnection();

   const is = await isAdmin(request);

   if (!is) {
      return Response.json(
         { msg: "UNAUTHORIZED", isOk: false, data: null },
         { status: 401 }
      );
   }

   const { current_name, name, description, image, lang_abbr } =
      await request.json();

   if (!current_name) {
      return Response.json(
         { msg: "CURRENT_NAME_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Validate lang_abbr if provided
   if (lang_abbr && !["en", "ar"].includes(lang_abbr)) {
      return Response.json(
         { msg: "INVALID_LANG_ABBR", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Compress image if provided
   let compressedImage = image;
   if (image && typeof image === "string" && image.length > 0) {
      try {
         compressedImage = await compressCategoryImage(image, 200, 85);
      } catch (error) {
         console.error("Image compression error:", error);
         return Response.json(
            { msg: "IMAGE_COMPRESSION_FAILED", isOk: false, data: null },
            { status: 500 }
         );
      }
   }

   // Validate image size if provided (using compressed image)
   if (compressedImage) {
      // Calculate size in bytes (base64 encoded data is ~33% larger than actual size)
      const imageSizeInBytes = (compressedImage.length * 3) / 4;
      const imageSizeInMB = imageSizeInBytes / (1024 * 1024);
      if (imageSizeInMB > 1) {
         return Response.json(
            { msg: "IMAGE_SIZE_EXCEEDS_1MB", isOk: false, data: null },
            { status: 400 }
         );
      }
   }

   // Validate at least one field is provided for update
   if (!name && !description && !compressedImage && !lang_abbr) {
      return Response.json(
         { msg: "AT_LEAST_ONE_FIELD_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Find existing category
   const existingCategory = await Category.findOne({
      name: current_name,
      lang_abbr: lang_abbr || "ar",
   });

   if (!existingCategory) {
      return Response.json(
         { msg: "CATEGORY_NOT_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   // If updating name, check if new name already exists
   if (name && name !== current_name) {
      const nameExists = await Category.findOne({
         name,
         lang_abbr: lang_abbr || "ar",
      });
      if (nameExists) {
         return Response.json(
            { msg: "CATEGORY_NAME_ALREADY_EXISTS", isOk: false, data: null },
            { status: 400 }
         );
      }
   }

   // Create update object (using compressed image)
   const updateFields: Record<string, string> = {};
   if (name) updateFields.name = name;
   if (description) updateFields.description = description;
   if (compressedImage) updateFields.image = compressedImage;
   if (lang_abbr) updateFields.lang_abbr = lang_abbr;

   const updatedCategory = await Category.findByIdAndUpdate(
      existingCategory._id,
      updateFields,
      { new: true }
   );

   if (!updatedCategory) {
      return Response.json(
         { msg: "FAILED_TO_UPDATE_CATEGORY", isOk: false, data: null },
         { status: 500 }
      );
   }

   return Response.json({
      msg: "CATEGORY_UPDATED",
      isOk: true,
      data: {
         category: {
            _id: updatedCategory._id,
            name: updatedCategory.name,
            description: updatedCategory.description,
            image: updatedCategory.image,
            lang_abbr: updatedCategory.lang_abbr,
            createdAt: updatedCategory.createdAt,
            updatedAt: updatedCategory.updatedAt,
         },
      },
   });
}

export async function DELETE(request: Request) {
   await initConnection();

   const is = await isAdmin(request);

   if (!is) {
      return Response.json(
         { msg: "UNAUTHORIZED", isOk: false, data: null },
         { status: 401 }
      );
   }

   const { name, lang_abbr } = await request.json();
   if (!name) {
      return Response.json(
         { msg: "NAME_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Validate lang_abbr if provided
   if (lang_abbr && !["en", "ar"].includes(lang_abbr)) {
      return Response.json(
         { msg: "INVALID_LANG_ABBR", isOk: false, data: null },
         { status: 400 }
      );
   }

   try {
      // First, delete all products that belong to this category
      const productDeleteResult = await Product.deleteMany({
         category: name,
      });

      // Then delete the category
      const result = await Category.deleteOne({
         name,
         lang_abbr: lang_abbr || "ar",
      });

      if (result.deletedCount === 0) {
         return Response.json(
            { msg: "CATEGORY_NOT_FOUND", isOk: false, data: null },
            { status: 404 }
         );
      }

      return Response.json({
         msg: "CATEGORY_DELETED",
         isOk: true,
         data: {
            deletedName: name,
            deletedProductsCount: productDeleteResult.deletedCount,
         },
      });
   } catch (error) {
      console.error("Error deleting category and related products:", error);
      return Response.json(
         { msg: "FAILED_TO_DELETE_CATEGORY", isOk: false, data: null },
         { status: 500 }
      );
   }
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

   const categories = await Category.find({
      lang_abbr: lang_abbr || "ar",
   });

   if (!categories.length) {
      return Response.json(
         { msg: "NO_CATEGORIES_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   return Response.json({
      msg: "CATEGORIES_FETCHED",
      isOk: true,
      data: { categories },
   });
}
