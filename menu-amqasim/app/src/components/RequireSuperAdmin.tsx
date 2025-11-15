"use client";

import useUserStore from "@/store/useUserStore";
import { redirect } from "next/navigation";
import { useEffect } from "react";

function RequireSuperAdmin() {
   const { role } = useUserStore((state) => state);

   useEffect(() => {
      if (!role) redirect("/");

      if (role !== "SUPERADMIN") {
         redirect("/");
      }
   }, [role]);
   return <></>;
}

export default RequireSuperAdmin;
