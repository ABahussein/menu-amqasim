import Product from "@/models/product";
import Category from "@/models/category";
import { initConnection } from "@/utils/connection";
import { isAdmin } from "@/utils/isAdmin";
import type { IAddon } from "@/models/product";
import { Jimp } from "jimp";

// Product image compression utility function using JIMP
const compressProductImage = async (
   base64Image: string,
   maxWidth: number = 300,
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
      console.error("Product image compression failed:", error);
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

   const {
      name,
      price,
      description,
      category,
      calories,
      image,
      allergies,
      addons,
   } = await request.json();

   if (!name) {
      return Response.json(
         { msg: "NAME_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   if (!price || price <= 0) {
      return Response.json(
         { msg: "VALID_PRICE_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   if (!category) {
      return Response.json(
         { msg: "CATEGORY_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Validate that the category exists
   const existingCategory = await Category.findOne({ name: category });
   if (!existingCategory) {
      return Response.json(
         { msg: "CATEGORY_NOT_FOUND", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Compress image if provided
   let compressedImage = image;
   if (image && typeof image === "string" && image.length > 0) {
      try {
         compressedImage = await compressProductImage(image, 300, 85);
      } catch (error) {
         console.error("Product image compression error:", error);
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

   // Validate calories if provided
   if (calories !== undefined && calories < 0) {
      return Response.json(
         { msg: "CALORIES_MUST_BE_NON_NEGATIVE", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Validate addons if provided
   if (addons && Array.isArray(addons)) {
      for (const addon of addons) {
         if (!addon.name || typeof addon.name !== "string") {
            return Response.json(
               { msg: "ADDON_NAME_REQUIRED", isOk: false, data: null },
               { status: 400 }
            );
         }
         if (addon.price === undefined || addon.price < 0) {
            return Response.json(
               {
                  msg: "ADDON_PRICE_MUST_BE_NON_NEGATIVE",
                  isOk: false,
                  data: null,
               },
               { status: 400 }
            );
         }
      }
   } else if (addons && !Array.isArray(addons)) {
      return Response.json(
         { msg: "ADDONS_MUST_BE_ARRAY", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Check if product with the same name already exists
   const existingProduct = await Product.findOne({ name });
   if (existingProduct) {
      return Response.json(
         { msg: "PRODUCT_ALREADY_EXISTS", isOk: false, data: null },
         { status: 400 }
      );
   }

   const product = await new Product({
      name,
      price,
      description,
      category,
      calories,
      image: compressedImage,
      allergies,
      addons: addons || [],
   }).save();

   if (!product) {
      return Response.json(
         { msg: "FAILED_TO_CREATE_PRODUCT", isOk: false, data: null },
         { status: 500 }
      );
   }

   return Response.json({
      msg: "PRODUCT_CREATED",
      isOk: true,
      data: {
         product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            calories: product.calories,
            image: product.image,
            allergies: product.allergies,
            addons: product.addons,
            createdAt: product.createdAt,
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

   const {
      current_name,
      name,
      price,
      description,
      category,
      calories,
      image,
      allergies,
      addons,
   } = await request.json();

   if (!current_name) {
      return Response.json(
         { msg: "CURRENT_NAME_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Validate price if provided
   if (price !== undefined && price <= 0) {
      return Response.json(
         { msg: "VALID_PRICE_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Validate category if provided
   if (category) {
      const existingCategory = await Category.findOne({ name: category });
      if (!existingCategory) {
         return Response.json(
            { msg: "CATEGORY_NOT_FOUND", isOk: false, data: null },
            { status: 400 }
         );
      }
   }

   // Compress image if provided
   let compressedImage = image;
   if (image && typeof image === "string" && image.length > 0) {
      try {
         compressedImage = await compressProductImage(image, 300, 85);
      } catch (error) {
         console.error("Product image compression error:", error);
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

   // Validate calories if provided
   if (calories !== undefined && calories < 0) {
      return Response.json(
         { msg: "CALORIES_MUST_BE_NON_NEGATIVE", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Validate addons if provided
   if (addons && Array.isArray(addons)) {
      for (const addon of addons) {
         if (!addon.name || typeof addon.name !== "string") {
            return Response.json(
               { msg: "ADDON_NAME_REQUIRED", isOk: false, data: null },
               { status: 400 }
            );
         }
         if (addon.price === undefined || addon.price < 0) {
            return Response.json(
               {
                  msg: "ADDON_PRICE_MUST_BE_NON_NEGATIVE",
                  isOk: false,
                  data: null,
               },
               { status: 400 }
            );
         }
      }
   } else if (addons && !Array.isArray(addons)) {
      return Response.json(
         { msg: "ADDONS_MUST_BE_ARRAY", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Validate at least one field is provided for update
   if (
      !name &&
      !price &&
      !description &&
      !category &&
      !calories &&
      !compressedImage &&
      !allergies &&
      !addons
   ) {
      return Response.json(
         { msg: "AT_LEAST_ONE_FIELD_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Find existing product
   const existingProduct = await Product.findOne({ name: current_name });

   if (!existingProduct) {
      return Response.json(
         { msg: "PRODUCT_NOT_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   // If updating name, check if new name already exists
   if (name && name !== current_name) {
      const nameExists = await Product.findOne({ name });
      if (nameExists) {
         return Response.json(
            { msg: "PRODUCT_NAME_ALREADY_EXISTS", isOk: false, data: null },
            { status: 400 }
         );
      }
   }

   // Create update object (using compressed image)
   const updateFields: Record<string, string | number | string[] | IAddon[]> =
      {};
   if (name) updateFields.name = name;
   if (price !== undefined) updateFields.price = price;
   if (description !== undefined) updateFields.description = description;
   if (category) updateFields.category = category;
   if (calories !== undefined) updateFields.calories = calories;
   if (compressedImage !== undefined) updateFields.image = compressedImage;
   if (allergies !== undefined) updateFields.allergies = allergies;
   if (addons !== undefined) updateFields.addons = addons;

   const updatedProduct = await Product.findByIdAndUpdate(
      existingProduct._id,
      updateFields,
      { new: true }
   );

   if (!updatedProduct) {
      return Response.json(
         { msg: "FAILED_TO_UPDATE_PRODUCT", isOk: false, data: null },
         { status: 500 }
      );
   }

   return Response.json({
      msg: "PRODUCT_UPDATED",
      isOk: true,
      data: {
         product: {
            _id: updatedProduct._id,
            name: updatedProduct.name,
            price: updatedProduct.price,
            description: updatedProduct.description,
            category: updatedProduct.category,
            calories: updatedProduct.calories,
            image: updatedProduct.image,
            allergies: updatedProduct.allergies,
            addons: updatedProduct.addons,
            createdAt: updatedProduct.createdAt,
            updatedAt: updatedProduct.updatedAt,
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

   const { name } = await request.json();
   if (!name) {
      return Response.json(
         { msg: "NAME_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   const result = await Product.deleteOne({ name });

   if (result.deletedCount === 0) {
      return Response.json(
         { msg: "PRODUCT_NOT_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   return Response.json({
      msg: "PRODUCT_DELETED",
      isOk: true,
      data: { deletedName: name },
   });
}

export async function GET(request: Request) {
   await initConnection();

   const { searchParams } = new URL(request.url);
   const category = searchParams.get("category");
   const lang_abbr = searchParams.get("lang_abbr");

   // Validate lang_abbr if provided
   if (lang_abbr && !["en", "ar"].includes(lang_abbr)) {
      return Response.json(
         { msg: "INVALID_LANG_ABBR", isOk: false, data: null },
         { status: 400 }
      );
   }

   const query: Record<string, string | { $in: string[] }> = {};

   // Find categories that match the lang_abbr to filter products by those categories
   const categories = await Category.find({
      lang_abbr: lang_abbr || "ar",
   });

   if (!categories.length) {
      return Response.json(
         { msg: "NO_CATEGORIES_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   const categoryNames = categories.map((cat) => cat.name);

   if (category) {
      // If specific category requested, check if it exists in the lang_abbr categories
      if (!categoryNames.includes(category)) {
         return Response.json(
            { msg: "CATEGORY_NOT_FOUND_FOR_LANGUAGE", isOk: false, data: null },
            { status: 404 }
         );
      }
      query.category = category;
   } else {
      // If no specific category, filter by all categories of the language
      query.category = { $in: categoryNames };
   }

   const products = await Product.find(query);

   if (!products.length) {
      return Response.json(
         { msg: "NO_PRODUCTS_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   return Response.json({
      msg: "PRODUCTS_FETCHED",
      isOk: true,
      data: { products },
   });
}
