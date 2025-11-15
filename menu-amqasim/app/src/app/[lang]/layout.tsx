import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "@emran-alhaddad/saudi-riyal-font/index.css";
import "./globals.css";
import SetDefaultLang from "@/components/SetDefaultLang";
import { getThemeColors, getBgImage } from "@/utils/theme";
import FetchDynamicContent from "@/components/FetchDynamicContent";
import { getLogo } from "@/utils/content";

const geistSans = Geist({
   variable: "--font-geist-sans",
   subsets: ["latin"],
});

const geistMono = Geist_Mono({
   variable: "--font-geist-mono",
   subsets: ["latin"],
});

const cairo = Cairo({
   variable: "--font-cairo",
   subsets: ["arabic", "latin", "latin-ext"],
   weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
   title: "Loading...",
   description: "Loading...",
};

export default async function RootLayout({
   children,
   params,
}: Readonly<{
   children: React.ReactNode;
   params: Promise<{ lang: string }>;
}>) {
   const { lang: langParam } = await params;
   const colors = await getThemeColors();
   const bgImage = await getBgImage();
   const logo = await getLogo();

   // Debug logging (remove in production)
   if (process.env.NODE_ENV === "development") {
      console.log(
         "Background image data:",
         bgImage ? "Image loaded" : "No image"
      );
   }

   return (
      <html lang={langParam} dir={langParam === "ar" ? "rtl" : "ltr"}>
         <body
            className={`${geistSans.variable} ${geistMono.variable} ${
               cairo.variable
            } antialiased ${
               bgImage && bgImage.trim() !== ""
                  ? "bg-cover bg-center bg-no-repeat bg-fixed"
                  : "bg-[var(--bg-color)]"
            } px-1`}
            style={
               {
                  "--bg-color": colors.bg,
                  "--text-color": colors.text,
                  "--product-card-bg-color": colors.product_card_bg,
                  "--category-card-bg-color": colors.category_card_bg,
                  "--utility-color": colors.utility,
                  color: "var(--text-color)",
                  fontFamily:
                     langParam === "ar"
                        ? "var(--font-cairo), 'Cairo', sans-serif"
                        : "var(--font-geist-sans), 'Geist', sans-serif",
                  ...(bgImage &&
                     bgImage.trim() !== "" && {
                        backgroundImage: `url("${bgImage}")`,
                     }),
               } as React.CSSProperties
            }
         >
            <SetDefaultLang langParam={langParam} />
            <FetchDynamicContent logo={logo} />
            {children}
         </body>
      </html>
   );
}
