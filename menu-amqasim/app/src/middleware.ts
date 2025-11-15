import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ar", "en"];

// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest): string {
   // Check if locale is specified in the URL
   const { pathname } = request.nextUrl;
   const pathnameLocale = locales.find(
      (locale) =>
         pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
   );

   if (pathnameLocale) return pathnameLocale;

   // Check for stored language preference in cookies
   const storedLang = request.cookies.get("preferred-lang")?.value;
   if (storedLang && locales.includes(storedLang as "ar" | "en")) {
      return storedLang as "ar" | "en";
   }

   // Check the Accept-Language header
   const acceptLanguage = request.headers.get("accept-language");

   if (acceptLanguage) {
      // Parse Accept-Language header and find best match
      const preferredLanguages = acceptLanguage
         .split(",")
         .map((lang) => {
            const [code, q = "1"] = lang.trim().split(";q=");
            return { code: code.split("-")[0], quality: parseFloat(q) };
         })
         .sort((a, b) => b.quality - a.quality);

      for (const { code } of preferredLanguages) {
         if (locales.includes(code as "ar" | "en")) {
            return code;
         }
      }
   }

   // Default to Arabic if no preference found
   return "ar";
}

export async function middleware(request: NextRequest) {
   // Check if there is any supported locale in the pathname
   const { pathname } = request.nextUrl;

   // Skip localization for API routes
   if (pathname.startsWith("/apis")) {
      return;
   }

   const pathnameHasLocale = locales.some(
      (locale) =>
         pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
   );

   if (pathnameHasLocale) return;

   // Redirect if there is no locale
   const locale = getLocale(request);
   request.nextUrl.pathname = `/${locale}${pathname}`;
   // e.g. incoming request is /products
   // The new URL is now /ar/products (default) or /en/products
   return NextResponse.redirect(request.nextUrl);
}

export const config = {
   matcher: [
      // Skip all internal paths (_next)
      "/((?!_next).*)",
      // Optional: only run on root (/) URL
      // '/'
   ],
};
