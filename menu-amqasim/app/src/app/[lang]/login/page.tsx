import MainHeader from "@/components/MainHeader";
import Modal from "@/components/Modal";
import { getDictionary } from "@/dictionaries/dictionaries";
import LoginForm from "./LoginForm";
import RenderTitleDescription from "@/components/RenderTitleDescription";

async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
   const { lang } = await params;

   const dict = getDictionary(lang as "ar" | "en");

   return (
      <div className="login-page min-h-screen">
         <MainHeader />
         <RenderTitleDescription />

         <div className="container">
            <div className="flex items-center justify-center min-h-[calc(100vh-120px)] py-12">
               {/* Login Form Container */}
               <div className="w-full max-w-md">
                  {/* Form Card */}
                  <div className="relative overflow-hidden">
                     {/* Background Pattern */}
                     <div
                        className="absolute inset-0 opacity-5"
                        style={{
                           backgroundImage: `radial-gradient(var(--utility-color) 1px, transparent 1px)`,
                           backgroundSize: "20px 20px",
                        }}
                     ></div>

                     {/* Card Content */}
                     <div className="relative bg-white/80 backdrop-blur-sm border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] rounded-3xl p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                           <h1 className="text-3xl font-bold text-[var(--utility-color)] mb-2">
                              {dict.login_page.title}
                           </h1>
                           <p className="text-[color-mix(in_srgb,var(--text-color)_70%,transparent)] text-sm">
                              {dict.login_page.subtitle}
                           </p>
                        </div>

                        {/* Login Form */}
                        <LoginForm lang={lang} />

                        {/* Contact Us Link */}
                        <div className="mt-8 text-center">
                           <p className="text-sm text-[color-mix(in_srgb,var(--text-color)_70%,transparent)]">
                              {dict.login_page.no_account}{" "}
                              <Modal
                                 title={dict.login_page.contact_us_title}
                                 trigger={
                                    <a
                                       href="#"
                                       className="text-[var(--utility-color)] hover:text-[color-mix(in_srgb,var(--utility-color)_85%,black)] transition-colors font-medium"
                                    >
                                       {dict.login_page.contact_us}
                                    </a>
                                 }
                              >
                                 <div className="text-center py-4">
                                    <p className="text-[var(--text-color)] leading-relaxed mb-4">
                                       {dict.login_page.contact_us_message}
                                    </p>
                                    <div className="bg-[color-mix(in_srgb,var(--bg-color)_90%,var(--utility-color))] rounded-xl p-4 border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))]">
                                       <a
                                          href="mailto:menuclone.email@gmail.com"
                                          className="text-[var(--utility-color)] font-semibold hover:text-[color-mix(in_srgb,var(--utility-color)_85%,black)] transition-colors"
                                       >
                                          menuclone.email@gmail.com
                                       </a>
                                    </div>
                                 </div>
                              </Modal>
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default LoginPage;
