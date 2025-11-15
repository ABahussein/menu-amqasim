import { SUPER_ADMIN_PASSWORD, SUPER_ADMIN_USERNAME } from "@/config";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRE } from "@/config";
import User, { USER_ROLES } from "@/models/user";
import { initConnection } from "@/utils/connection";

export async function POST(request: Request) {
   try {
      await initConnection();

      // Check if username and password are provided
      const { username, password } = await request.json();
      if (!username || !password) {
         return Response.json(
            { msg: "USERNAME_PASSWORD_REQUIRED", isOk: false, data: null },
            { status: 400 }
         );
      }

      // Return token if the user is super admin
      if (
         username === SUPER_ADMIN_USERNAME &&
         password === SUPER_ADMIN_PASSWORD
      ) {
         const token = jwt.sign(
            { username, role: USER_ROLES.SUPERADMIN },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
         );

         return Response.json({
            msg: "LOGIN_SUCCESS",
            isOk: true,
            data: {
               role: USER_ROLES.SUPERADMIN,
               token: token,
               username: username,
            },
         });
      }

      // Return token if user is registered admin in the database
      const admin = await User.findOne({
         username,
         password, // Plain text password match (NOT RECOMMENDED - SECURITY RISK)
         role: USER_ROLES.ADMIN,
      });
      if (!admin) {
         return Response.json(
            { msg: "INVALID_CREDENTIALS", isOk: false, data: null },
            { status: 401 }
         );
      }

      // Generate JWT token
      const token = jwt.sign({ username, role: USER_ROLES.ADMIN }, JWT_SECRET, {
         expiresIn: JWT_EXPIRE,
      });

      return Response.json({
         msg: "LOGIN_SUCCESS",
         isOk: true,
         data: {
            role: USER_ROLES.ADMIN,
            token: token,
            username: username,
         },
      });
   } catch (error) {
      console.error("Login API error:", error);
      return Response.json(
         { msg: "INTERNAL_SERVER_ERROR", isOk: false, data: null },
         { status: 500 }
      );
   }
}
