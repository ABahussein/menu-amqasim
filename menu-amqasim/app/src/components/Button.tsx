import React from "react";
import { Loader2, LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
   size?: "sm" | "md" | "lg";
   loading?: boolean;
   icon?: LucideIcon;
   rounded?: boolean;
   children: React.ReactNode;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
   size?: "sm" | "md" | "lg";
   loading?: boolean;
   icon?: LucideIcon;
   children: React.ReactNode;
}

function Button({
   variant = "primary",
   size = "md",
   loading = false,
   icon,
   rounded = false,
   className = "",
   children,
   disabled,
   ...props
}: ButtonProps) {
   const baseStyles = `inline-flex items-center justify-center gap-2 font-medium ${
      rounded ? "rounded-full" : "rounded-xl"
   } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group`;

   const variants = {
      primary:
         "bg-[var(--utility-color)] text-white hover:bg-[color-mix(in_srgb,var(--utility-color)_85%,black)] focus:ring-[var(--utility-color)]/20 shadow-lg shadow-[var(--utility-color)]/20 hover:shadow-xl hover:shadow-[var(--utility-color)]/30 hover:-translate-y-0.5",

      secondary:
         "bg-[color-mix(in_srgb,var(--bg-color)_90%,var(--utility-color))] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--bg-color)_80%,var(--utility-color))] focus:ring-[var(--utility-color)]/20 border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))]",

      outline:
         "border-2 border-[var(--utility-color)] text-[var(--utility-color)] hover:bg-[var(--utility-color)] hover:text-white focus:ring-[var(--utility-color)]/20",

      ghost: "text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--bg-color)_85%,var(--utility-color))] focus:ring-[var(--utility-color)]/20",

      danger:
         "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5",
   };

   const sizes = {
      sm: "px-3 py-2 text-sm h-8",
      md: "px-6 py-2.5 text-sm h-10",
      lg: "px-8 py-3 text-base h-12",
   };

   return (
      <button
         className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
         disabled={disabled || loading}
         {...props}
      >
         {/* Shimmer effect for primary and danger variants */}
         {(variant === "primary" || variant === "danger") && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
         )}

         {/* Loading spinner */}
         {loading && <Loader2 className="w-4 h-4 animate-spin" />}

         {/* Content */}
         <span className="relative z-10 flex items-center gap-2">
            {icon &&
               React.createElement(icon, {
                  size: size === "sm" ? 16 : size === "lg" ? 20 : 18,
               })}
            {children}
         </span>

         {/* Subtle dot pattern overlay for primary and danger variants */}
         {(variant === "primary" || variant === "danger") && (
            <div
               className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
               style={{
                  backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)`,
                  backgroundSize: "12px 12px",
               }}
            ></div>
         )}
      </button>
   );
}

export default Button;
