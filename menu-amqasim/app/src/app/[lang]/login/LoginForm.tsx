"use client";

import Field from "@/components/Field";
import { User } from "lucide-react";
import Button from "@/components/Button";
import { getDictionary } from "@/dictionaries/dictionaries";
import Modal from "@/components/Modal";
import call from "@/utils/call";
import { useEffect, useState } from "react";
import useUserStore, { UserStoreState } from "@/store/useUserStore";
import Alert from "@/components/Alert";
import { redirect } from "next/navigation";

function LoginForm({ lang }: { lang: string }) {
   const [error, setError] = useState<string | null>(null);

   const { setUser, username } = useUserStore(
      (state) => state
   ) as UserStoreState;

   const dict = getDictionary(lang as "ar" | "en");

   const handleSumbit = async (e: React.FormEvent) => {
      e.preventDefault();

      // form data
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const username = formData.get("username");
      const password = formData.get("password");

      const { isOk, data, msg } = await call({
         url: "/apis/login",
         method: "POST",
         body: JSON.stringify({ username, password }),
      });

      if (!isOk) {
         setError(msg);
      }

      if (data) {
         setUser(data.role, data.token, data.username); // set user in zustand store
         // Reset form
         form.reset();
      }
   };

   useEffect(() => {
      if (!username) return;
      redirect("/"); // Redirect to home if already logged in
   }, [username]);

   return (
      <form className="space-y-6" onSubmit={handleSumbit}>
         {error && (
            <Alert variant="error" title={error} onClose={() => setError(null)}>
               {dict.login_page.invalid_credentials}
            </Alert>
         )}
         {/* Username Field */}
         <Field
            label={dict.login_page.username}
            icon="user"
            placeholder={dict.login_page.username_placeholder}
            variant="filled"
            size="lg"
            name="username"
            required
         />

         {/* Password Field */}
         <Field
            label={dict.login_page.password}
            icon="lock"
            type="password"
            placeholder={dict.login_page.password_placeholder}
            variant="filled"
            size="lg"
            name="password"
            required
         />

         {/* Forgot Password Link */}
         <div className="flex justify-end">
            <Modal
               title={dict.login_page.forgot_password_title}
               trigger={
                  <a
                     href="#"
                     className="text-sm text-[var(--utility-color)] hover:text-[color-mix(in_srgb,var(--utility-color)_85%,black)] transition-colors font-medium"
                  >
                     {dict.login_page.forgot_password}
                  </a>
               }
            >
               <p className="text-[var(--text-color)] leading-relaxed">
                  {dict.login_page.forgot_password_message}
               </p>
            </Modal>
         </div>

         {/* Login Button */}
         <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={User}
            rounded
            className="w-full"
         >
            {dict.login_page.login_button}
         </Button>
      </form>
   );
}

export default LoginForm;
