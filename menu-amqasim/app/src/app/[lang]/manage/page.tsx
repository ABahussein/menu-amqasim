import MainHeader from "@/components/MainHeader";
import RequireSuperAdmin from "@/components/RequireSuperAdmin";
import AdminsSection from "./AdminsSection";
import ThemeSection from "./ThemeSection";
import BackgroundSection from "./BackgroundSection";
import RenderTitleDescription from "@/components/RenderTitleDescription";

async function ManagePage({ params }: { params: Promise<{ lang: string }> }) {
   const { lang } = await params;

   return (
      <div className="manage-page">
         <MainHeader />
         <RequireSuperAdmin />

         <div className="container">
            <AdminsSection lang={lang} />
            <RenderTitleDescription />
            <BackgroundSection lang={lang} />
            <ThemeSection lang={lang} />
         </div>
      </div>
   );
}

export default ManagePage;
