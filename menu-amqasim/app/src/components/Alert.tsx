"use client";

import React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface AlertProps {
   variant?: "default" | "success" | "error" | "info" | "warning";
   title?: string;
   children: React.ReactNode;
   onClose?: () => void;
   showIcon?: boolean;
   className?: string;
}

function Alert({
   variant = "default",
   title,
   children,
   onClose,
   showIcon = true,
   className = "",
}: AlertProps) {
   const variants = {
      default: {
         container:
            "bg-[color-mix(in_srgb,var(--bg-color)_90%,var(--utility-color))] border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] text-[var(--text-color)]",
         icon: "text-[var(--utility-color)]",
         iconComponent: Info,
         dotColor: "var(--utility-color)",
      },
      success: {
         container: "bg-green-50/90 border-green-200 text-green-800",
         icon: "text-green-600",
         iconComponent: CheckCircle,
         dotColor: "#16a34a",
      },
      error: {
         container: "bg-red-50/90 border-red-200 text-red-800",
         icon: "text-red-600",
         iconComponent: AlertCircle,
         dotColor: "#dc2626",
      },
      info: {
         container: "bg-blue-50/90 border-blue-200 text-blue-800",
         icon: "text-blue-600",
         iconComponent: Info,
         dotColor: "#2563eb",
      },
      warning: {
         container: "bg-yellow-50/90 border-yellow-200 text-yellow-800",
         icon: "text-yellow-600",
         iconComponent: AlertTriangle,
         dotColor: "#ca8a04",
      },
   };

   const currentVariant = variants[variant];
   const IconComponent = currentVariant.iconComponent;

   return (
      <div
         className={`relative overflow-hidden rounded-xl border backdrop-blur-sm p-4 shadow-lg transition-all duration-200 ${currentVariant.container} ${className}`}
         role="alert"
      >
         {/* Background Pattern */}
         <div
            className="absolute inset-0 opacity-5"
            style={{
               backgroundImage: `radial-gradient(${currentVariant.dotColor} 1px, transparent 1px)`,
               backgroundSize: "20px 20px",
            }}
         />

         {/* Content Container */}
         <div className="relative flex gap-3">
            {/* Icon */}
            {showIcon && (
               <div className={`flex-shrink-0 mt-0.5 ${currentVariant.icon}`}>
                  <IconComponent size={20} />
               </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
               {/* Title */}
               {title && (
                  <div className="flex items-center gap-2 mb-1">
                     <h4 className="text-sm font-semibold">{title}</h4>
                  </div>
               )}

               {/* Message */}
               <div className="text-sm leading-relaxed">{children}</div>
            </div>

            {/* Close Button */}
            {onClose && (
               <button
                  type="button"
                  onClick={onClose}
                  className={`flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                     variant === "default"
                        ? "focus:ring-[var(--utility-color)]/20 text-[color-mix(in_srgb,var(--text-color)_60%,transparent)] hover:text-[var(--text-color)]"
                        : `focus:ring-${
                             variant === "success"
                                ? "green"
                                : variant === "error"
                                ? "red"
                                : variant === "info"
                                ? "blue"
                                : "yellow"
                          }-500/20`
                  }`}
                  aria-label="Close alert"
               >
                  <X size={16} />
               </button>
            )}
         </div>

         {/* Decorative Elements */}
         <div
            className="absolute -top-2 -left-2 w-8 h-8 rounded-full blur-lg opacity-30"
            style={{
               background: `linear-gradient(135deg, ${currentVariant.dotColor}40, transparent)`,
            }}
         />
         <div
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full blur-lg opacity-20"
            style={{
               background: `linear-gradient(315deg, ${currentVariant.dotColor}30, transparent)`,
            }}
         />

         {/* Shimmer Effect */}
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-pulse opacity-20" />
      </div>
   );
}

export default Alert;
