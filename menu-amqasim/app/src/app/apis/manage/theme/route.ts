import Theme from "@/models/theme";
import { initConnection } from "@/utils/connection";
import { isSuperAdmin } from "@/utils/isSuperAdmin";

// Ensure default theme exists
const ensureDefaultTheme = async () => {
   try {
      const existingTheme = await Theme.findOne();
      if (!existingTheme) {
         await new Theme().save(); // Will use default values from schema
         console.log("Default theme created successfully");
      }
   } catch (error) {
      console.error("Failed to ensure default theme:", error);
   }
};

export async function PUT(request: Request) {
   await initConnection();

   const is = await isSuperAdmin(request);

   if (!is) {
      return Response.json(
         { msg: "UNAUTHORIZED", isOk: false, data: null },
         { status: 401 }
      );
   }

   const { colors, view_style } = await request.json();

   // Validate at least one field is provided for update
   if (!colors && !view_style) {
      return Response.json(
         { msg: "COLORS_OR_VIEW_STYLE_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Ensure default theme exists
   await ensureDefaultTheme();

   // Find existing theme
   const existingTheme = await Theme.findOne();
   if (!existingTheme) {
      return Response.json(
         { msg: "THEME_NOT_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   // Create update object with proper color merging
   const updateFields: Record<string, string> = {};

   // Handle colors with dot notation to merge instead of replace
   if (colors) {
      Object.keys(colors).forEach((colorKey) => {
         updateFields[`colors.${colorKey}`] = colors[colorKey];
      });
   }

   if (view_style) updateFields.view_style = view_style;

   const updatedTheme = await Theme.findByIdAndUpdate(
      existingTheme._id,
      updateFields,
      { new: true }
   );

   if (!updatedTheme) {
      return Response.json(
         { msg: "FAILED_TO_UPDATE_THEME", isOk: false, data: null },
         { status: 500 }
      );
   }

   return Response.json({
      msg: "THEME_UPDATED",
      isOk: true,
      data: {
         theme: {
            _id: updatedTheme._id,
            colors: updatedTheme.colors,
            view_style: updatedTheme.view_style,
            createdAt: updatedTheme.createdAt,
            updatedAt: updatedTheme.updatedAt,
         },
      },
   });
}

export async function GET() {
   await initConnection();

   // Ensure default theme exists
   await ensureDefaultTheme();

   const theme = await Theme.findOne();

   if (!theme) {
      return Response.json(
         { msg: "THEME_NOT_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   return Response.json({
      msg: "THEME_FETCHED",
      isOk: true,
      data: { theme },
   });
}
