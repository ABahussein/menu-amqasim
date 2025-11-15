"use client";

import React, { forwardRef } from "react";
import {
   Eye,
   EyeOff,
   Mail,
   Lock,
   User,
   Search,
   Phone,
   Calendar,
   Globe,
   CreditCard,
   MapPin,
   Building,
} from "lucide-react";

type IconName =
   | "mail"
   | "lock"
   | "user"
   | "search"
   | "phone"
   | "calendar"
   | "globe"
   | "credit-card"
   | "map-pin"
   | "building";

interface FieldProps
   extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
   label?: string;
   error?: string;
   hint?: string;
   icon?: IconName;
   variant?: "default" | "filled";
   size?: "sm" | "md" | "lg";
   rounded?: boolean;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(
   (
      {
         label,
         error,
         hint,
         icon,
         variant = "default",
         size = "md",
         type = "text",
         className = "",
         disabled,
         id,
         rounded = false,
         ...props
      },
      ref
   ) => {
      const [showPassword, setShowPassword] = React.useState(false);
      const [isFocused, setIsFocused] = React.useState(false);

      // Generate a unique ID if none provided
      const generatedId = React.useId();
      const fieldId = id || `field-${generatedId}`;

      const isPassword = type === "password";
      const inputType = isPassword
         ? showPassword
            ? "text"
            : "password"
         : type;

      const baseStyles =
         "w-full transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

      const variants = {
         default: `border-2 bg-transparent ${
            error
               ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
               : isFocused
               ? "border-[var(--utility-color)] focus:ring-2 focus:ring-[var(--utility-color)]/20"
               : "border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] hover:border-[var(--utility-color)]"
         } text-[var(--text-color)] placeholder:text-[color-mix(in_srgb,var(--text-color)_60%,transparent)]`,

         filled: `border-0 ${
            error
               ? "bg-red-50 focus:bg-red-50 focus:ring-2 focus:ring-red-500/20"
               : "bg-[color-mix(in_srgb,var(--bg-color)_90%,var(--utility-color))] focus:bg-[color-mix(in_srgb,var(--bg-color)_85%,var(--utility-color))] focus:ring-2 focus:ring-[var(--utility-color)]/20"
         } text-[var(--text-color)] placeholder:text-[color-mix(in_srgb,var(--text-color)_60%,transparent)]`,
      };

      const sizes = {
         sm: `px-3 py-2 text-sm h-9 ${rounded ? "rounded-full" : "rounded-lg"}`,
         md: `px-4 py-3 text-sm h-11 ${
            rounded ? "rounded-full" : "rounded-xl"
         }`,
         lg: `px-5 py-4 text-base h-13 ${
            rounded ? "rounded-full" : "rounded-xl"
         }`,
      };

      const iconSizes = {
         sm: 16,
         md: 18,
         lg: 20,
      };

      // Map icon names to components
      const getIconComponent = (iconName: IconName) => {
         const iconMap = {
            mail: Mail,
            lock: Lock,
            user: User,
            search: Search,
            phone: Phone,
            calendar: Calendar,
            globe: Globe,
            "credit-card": CreditCard,
            "map-pin": MapPin,
            building: Building,
         };
         return iconMap[iconName];
      };

      return (
         <div className="w-full">
            {/* Label */}
            {label && (
               <label
                  htmlFor={fieldId}
                  className="block text-sm font-medium text-[var(--text-color)] mb-2"
               >
                  {label}
               </label>
            )}

            {/* Input Container */}
            <div className="relative">
               {/* Icon */}
               {icon && (
                  <div className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-[color-mix(in_srgb,var(--text-color)_60%,transparent)]">
                     {React.createElement(getIconComponent(icon), {
                        size: iconSizes[size],
                     })}
                  </div>
               )}

               {/* Input Field */}
               <input
                  ref={ref}
                  id={fieldId}
                  type={inputType}
                  className={`${baseStyles} ${variants[variant]} ${
                     sizes[size]
                  } ${icon ? "ltr:pl-10 rtl:pr-10" : ""} ${
                     isPassword ? "ltr:pr-10 rtl:pl-10" : ""
                  } ${className}`}
                  disabled={disabled}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  {...props}
               />

               {/* Password Toggle */}
               {isPassword && (
                  <button
                     type="button"
                     className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-[color-mix(in_srgb,var(--text-color)_60%,transparent)] hover:text-[var(--text-color)] transition-colors"
                     onClick={() => setShowPassword(!showPassword)}
                     tabIndex={-1}
                  >
                     {showPassword ? (
                        <EyeOff size={iconSizes[size]} />
                     ) : (
                        <Eye size={iconSizes[size]} />
                     )}
                  </button>
               )}
            </div>

            {/* Error Message */}
            {error && (
               <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {error}
               </p>
            )}

            {/* Hint Message */}
            {hint && !error && (
               <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--text-color)_70%,transparent)]">
                  {hint}
               </p>
            )}
         </div>
      );
   }
);

Field.displayName = "Field";

export default Field;
