import MainHeader from "@/components/MainHeader";
import { getDictionary } from "@/dictionaries/dictionaries";
import UpperSection from "./upper/UpperSection";
import CategorySlider from "./category/CategorySlider";
import ProductsView from "./product/ProductsView";
import RenderTitleDescription from "@/components/RenderTitleDescription";

async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
   const { lang } = await params;

   const dict = getDictionary(lang as "ar" | "en");

   return (
      <div className="landing-page text-text min-h-screen">
         <MainHeader />
         <RenderTitleDescription />

         <div className="container">
            <UpperSection dict={dict} />

            <CategorySlider dict={dict} />

            <ProductsView />

            <footer className="mt-16 py-2 text-center">
               <div className="border-t border-[color-mix(in_srgb,var(--text-color)_10%,transparent)] pt-2">
                  <p className="text-[color-mix(in_srgb,var(--text-color)_60%,transparent)] text-sm font-medium">
                     {dict.footer.made_with_love}
                  </p>
               </div>
            </footer>
         </div>
      </div>
   );
}

export default LandingPage;
