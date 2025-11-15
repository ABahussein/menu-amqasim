import { JWT_SECRET, SUPER_ADMIN_USERNAME } from "@/config";
import jwt from "jsonwebtoken";

export const isSuperAdmin = async (request: Request) => {
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
      return false;
   }

   return true;
};
