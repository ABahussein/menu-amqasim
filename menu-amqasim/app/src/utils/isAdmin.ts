import { JWT_SECRET, SUPER_ADMIN_USERNAME } from "@/config";
import User from "@/models/user";
import jwt from "jsonwebtoken";

export const isAdmin = async (request: Request) => {
   const token = request.headers.get("Authorization")?.split(" ")[1];

   if (!token) {
      return false;
   }

   const decoded = jwt.verify(token, JWT_SECRET);
   const { username, role: tokenRole } = decoded as {
      username: string;
      role: string;
   };

   if (tokenRole !== "SUPERADMIN" && username !== SUPER_ADMIN_USERNAME) {
      const admin = await User.findOne({ username, role: tokenRole });
      if (!admin) {
         return false;
      }
   }

   return true;
};
