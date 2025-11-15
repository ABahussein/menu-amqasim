"use client";

import { getDictionary } from "@/dictionaries/dictionaries";
import useUserStore from "@/store/useUserStore";
import call from "@/utils/call";
import { useEffect, useState } from "react";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import Modal from "@/components/Modal";
import { UserPlus, Shield, Trash2, Users, AlertTriangle } from "lucide-react";

interface Admin {
   _id: string;
   username: string;
   password: string;
   role: string;
}

function AdminsSection({ lang }: { lang: string }) {
   const dict = getDictionary(lang as "ar" | "en");
   const [admins, setAdmins] = useState<Admin[]>([]);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

   const { token } = useUserStore((state) => state);

   // Fetch admins from API
   useEffect(() => {
      async function fetchAdmins() {
         try {
            const { isOk, data, msg } = await call({
               url: "/apis/manage",
               method: "GET",
               headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
               },
            });

            if (!isOk) {
               setError(msg);
            }

            if (data) {
               setAdmins(data.admins);
               setError(null);
            }
         } catch (error) {
            console.error("Error fetching admins:", error);
            setError(dict.manage_page.admins_section.error_fetching);
         }
      }
      fetchAdmins();
   }, [dict.manage_page.admins_section.error_fetching, token]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Get form data
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      // Validate password length
      if (password.length < 6) {
         setError(dict.manage_page.admins_section.password_min_length);
         setLoading(false);
         return;
      }

      try {
         const { isOk, data, msg } = await call({
            url: "/apis/manage",
            method: "POST",
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
         });

         if (!isOk) {
            setError(msg);
         } else if (data) {
            setSuccess(dict.manage_page.admins_section.admin_created);
            setAdmins([...admins, data.admin]);
            form.reset();
         }
      } catch (error) {
         console.error("Error creating admin:", error);
         setError(dict.manage_page.admins_section.error_creating);
      } finally {
         setLoading(false);
      }
   };

   const handleDeleteAdmin = async (username: string) => {
      setDeleteLoading(username);
      setError(null);
      setSuccess(null);

      try {
         const { isOk, msg } = await call({
            url: "/apis/manage",
            method: "DELETE",
            headers: {
               Authorization: `Bearer ${token}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
         });

         if (!isOk) {
            setError(msg);
         } else {
            setSuccess(dict.manage_page.admins_section.admin_deleted);
            setAdmins(admins.filter((admin) => admin.username !== username));
         }
      } catch (error) {
         console.error("Error deleting admin:", error);
         setError(dict.manage_page.admins_section.error_deleting);
      } finally {
         setDeleteLoading(null);
      }
   };

   return (
      <div className="admins-section space-y-8 py-5">
         {/* Header */}
         <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
               <div className="p-3 bg-[color-mix(in_srgb,var(--utility-color)_10%,transparent)] rounded-full">
                  <Shield className="w-8 h-8 text-[var(--utility-color)]" />
               </div>
               <h2 className="text-3xl font-bold text-[var(--text-color)]">
                  {dict.manage_page.admins_section.title}
               </h2>
            </div>
            <p className="text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] max-w-2xl mx-auto">
               {dict.manage_page.admins_section.subtitle}
            </p>
         </div>

         {/* Alerts */}
         {error && (
            <Alert variant="error" title={error} onClose={() => setError(null)}>
               {error}
            </Alert>
         )}
         {success && (
            <Alert
               variant="success"
               title={success}
               onClose={() => setSuccess(null)}
            >
               {success}
            </Alert>
         )}

         {/* Form to add new admin */}
         <div className="bg-white/80 backdrop-blur-sm border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] rounded-3xl p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div
               className="absolute inset-0 opacity-5"
               style={{
                  backgroundImage: `radial-gradient(var(--utility-color) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
               }}
            ></div>

            <div className="relative">
               <div className="flex items-center gap-3 mb-6">
                  <UserPlus className="w-6 h-6 text-[var(--utility-color)]" />
                  <h3 className="text-xl font-semibold text-[var(--text-color)]">
                     {dict.manage_page.admins_section.add_admin}
                  </h3>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Field
                        label={dict.manage_page.admins_section.username}
                        icon="user"
                        placeholder={
                           dict.manage_page.admins_section.username_placeholder
                        }
                        variant="filled"
                        size="lg"
                        name="username"
                        required
                     />

                     <Field
                        label={dict.manage_page.admins_section.password}
                        icon="lock"
                        type="password"
                        placeholder={
                           dict.manage_page.admins_section.password_placeholder
                        }
                        variant="filled"
                        size="lg"
                        name="password"
                        required
                     />
                  </div>

                  <Button
                     type="submit"
                     variant="primary"
                     size="lg"
                     icon={UserPlus}
                     rounded
                     loading={loading}
                     className="w-full md:w-auto"
                  >
                     {dict.manage_page.admins_section.create_admin}
                  </Button>
               </form>
            </div>
         </div>

         {/* Admins List */}
         <div className="bg-white/80 backdrop-blur-sm border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] rounded-3xl p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div
               className="absolute inset-0 opacity-5"
               style={{
                  backgroundImage: `radial-gradient(var(--utility-color) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
               }}
            ></div>

            <div className="relative">
               <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-[var(--utility-color)]" />
                  <h3 className="text-xl font-semibold text-[var(--text-color)]">
                     {dict.manage_page.admins_section.admin_list}
                  </h3>
                  {admins.length > 0 && (
                     <span className="px-3 py-1 bg-[color-mix(in_srgb,var(--utility-color)_10%,transparent)] text-[var(--utility-color)] text-sm font-medium rounded-full border border-[color-mix(in_srgb,var(--utility-color)_20%,transparent)]">
                        {admins.length}
                     </span>
                  )}
               </div>

               {admins.length === 0 ? (
                  <div className="text-center py-12">
                     <div className="flex items-center justify-center gap-3 mb-4">
                        <Users className="w-12 h-12 text-[color-mix(in_srgb,var(--text-color)_40%,transparent)]" />
                     </div>
                     <p className="text-[color-mix(in_srgb,var(--text-color)_60%,transparent)] text-lg">
                        {dict.manage_page.admins_section.no_admins}
                     </p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {admins.map((admin) => (
                        <div
                           key={admin.username}
                           className="bg-[color-mix(in_srgb,var(--bg-color)_95%,white)] border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] rounded-2xl p-6 hover:shadow-lg hover:shadow-[var(--utility-color)]/10 transition-all duration-200 hover:-translate-y-1"
                        >
                           <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                 <div className="p-2 bg-[color-mix(in_srgb,var(--utility-color)_10%,transparent)] rounded-full">
                                    <Shield className="w-5 h-5 text-[var(--utility-color)]" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-[var(--text-color)] truncate">
                                       @{admin.username}
                                    </h4>
                                    <p className="text-sm text-[color-mix(in_srgb,var(--text-color)_60%,transparent)]">
                                       {admin.role}
                                    </p>
                                 </div>
                              </div>

                              <Modal
                                 title={
                                    dict.manage_page.admins_section.delete_admin
                                 }
                                 trigger={
                                    <button
                                       className="p-2 text-[color-mix(in_srgb,var(--text-color)_60%,transparent)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                       disabled={
                                          deleteLoading === admin.username
                                       }
                                    >
                                       {deleteLoading === admin.username ? (
                                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                       ) : (
                                          <Trash2 className="w-4 h-4" />
                                       )}
                                    </button>
                                 }
                              >
                                 <div className="text-center py-4">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                       <div className="p-3 bg-red-50 rounded-full">
                                          <AlertTriangle className="w-6 h-6 text-red-500" />
                                       </div>
                                    </div>
                                    <p className="text-[var(--text-color)] leading-relaxed mb-6">
                                       {
                                          dict.manage_page.admins_section
                                             .confirm_delete
                                       }
                                    </p>
                                    <div className="bg-[color-mix(in_srgb,var(--bg-color)_90%,var(--utility-color))] rounded-xl p-4 border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] mb-6">
                                       <p className="font-semibold text-[var(--text-color)]">
                                          @{admin.username}
                                       </p>
                                    </div>
                                    <div className="flex gap-3 justify-center">
                                       <Button
                                          variant="secondary"
                                          size="md"
                                          rounded
                                          onClick={() => {}}
                                       >
                                          Cancel
                                       </Button>
                                       <Button
                                          variant="danger"
                                          size="md"
                                          icon={Trash2}
                                          rounded
                                          loading={
                                             deleteLoading === admin.username
                                          }
                                          onClick={() =>
                                             handleDeleteAdmin(admin.username)
                                          }
                                       >
                                          {
                                             dict.manage_page.admins_section
                                                .delete_admin
                                          }
                                       </Button>
                                    </div>
                                 </div>
                              </Modal>
                           </div>

                           {/* Show password on creation (if available) */}
                           {admin.password && (
                              <div className="mt-4 pt-4 border-t border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))]">
                                 <p className="text-xs text-[color-mix(in_srgb,var(--text-color)_60%,transparent)] mb-2">
                                    {dict.manage_page.admins_section.password}
                                 </p>
                                 <code className="text-xs bg-[color-mix(in_srgb,var(--bg-color)_85%,var(--utility-color))] px-2 py-1 rounded font-mono">
                                    {admin.password}
                                 </code>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

export default AdminsSection;
