import { SUPER_ADMIN_USERNAME } from "@/config";
import User from "@/models/user";
import { initConnection } from "@/utils/connection";
import { isSuperAdmin } from "@/utils/isSuperAdmin";

export async function POST(request: Request) {
   await initConnection();

   const is = await isSuperAdmin(request);

   if (!is) {
      return Response.json(
         { msg: "UNAUTHORIZED", isOk: false, data: null },
         { status: 401 }
      );
   }

   const { username, password } = await request.json();
   if (!username || !password) {
      return Response.json(
         { msg: "USERNAME_PASSWORD_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Check if admin with the same username already exists
   const existingAdmin = await User.findOne({ username, role: "ADMIN" });
   if (existingAdmin) {
      return Response.json(
         { msg: "ADMIN_ALREADY_EXISTS", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Check if trying to create super admin account
   if (username === SUPER_ADMIN_USERNAME) {
      return Response.json(
         { msg: "CANNOT_CREATE_SUPERADMIN", isOk: false, data: null },
         { status: 403 }
      );
   }

   // Store plain text password (NOT RECOMMENDED - SECURITY RISK)
   const admin = await new User({
      username,
      password: password, // Storing plain text
      role: "ADMIN",
   }).save();

   if (!admin) {
      return Response.json(
         { msg: "FAILED_TO_CREATE_ADMIN", isOk: false, data: null },
         { status: 500 }
      );
   }

   return Response.json({
      msg: "ADMIN_CREATED",
      isOk: true,
      data: {
         admin: {
            username: admin.username,
            role: admin.role,
            password: password, // Return plain password only on creation
         },
      },
   });
}

export async function DELETE(request: Request) {
   await initConnection();

   const is = await isSuperAdmin(request);

   if (!is) {
      return Response.json(
         { msg: "UNAUTHORIZED", isOk: false, data: null },
         { status: 401 }
      );
   }

   const { username } = await request.json();
   if (!username) {
      return Response.json(
         { msg: "USERNAME_REQUIRED", isOk: false, data: null },
         { status: 400 }
      );
   }

   // Prevent deletion of super admin account
   if (username === SUPER_ADMIN_USERNAME) {
      return Response.json(
         { msg: "CANNOT_DELETE_SUPERADMIN", isOk: false, data: null },
         { status: 403 }
      );
   }

   const result = await User.deleteOne({ username, role: "ADMIN" });

   if (result.deletedCount === 0) {
      return Response.json(
         { msg: "ADMIN_NOT_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   return Response.json({
      msg: "ADMIN_DELETED",
      isOk: true,
      data: { deletedUsername: username },
   });
}

export async function GET(request: Request) {
   await initConnection();

   const is = await isSuperAdmin(request);

   if (!is) {
      return Response.json(
         { msg: "UNAUTHORIZED", isOk: false, data: null },
         { status: 401 }
      );
   }

   const admins = await User.find({ role: "ADMIN" }).select(
      "+password -updatedAt -__v "
   );

   if (!admins.length) {
      return Response.json(
         { msg: "NO_ADMINS_FOUND", isOk: false, data: null },
         { status: 404 }
      );
   }

   return Response.json({
      msg: "ADMINS_FETCHED",
      isOk: true,
      data: { admins },
   });
}
