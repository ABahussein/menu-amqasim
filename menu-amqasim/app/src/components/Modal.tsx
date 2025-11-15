"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
   trigger: React.ReactNode;
   title?: string;
   children: React.ReactNode;
   size?: "sm" | "md" | "lg" | "xl";
   showCloseButton?: boolean;
   closeOnBackdrop?: boolean;
   isOpen?: boolean;
   onOpen?: () => void;
   onClose?: () => void;
   onDismiss?: () => void;
}

function Modal({
   trigger,
   title,
   children,
   size = "md",
   showCloseButton = true,
   closeOnBackdrop = true,
   isOpen: controlledIsOpen,
   onOpen,
   onClose,
   onDismiss,
}: ModalProps) {
   const modalRef = useRef<HTMLDivElement>(null);
   const [internalIsOpen, setInternalIsOpen] = React.useState(false);
   const [isAnimating, setIsAnimating] = React.useState(false);
   const [isMounted, setIsMounted] = React.useState(false);

   // Use controlled state if provided, otherwise use internal state
   const isOpen =
      controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

   // Ensure we're on the client side
   useEffect(() => {
      setIsMounted(true);
   }, []);

   const handleOpen = React.useCallback(() => {
      if (onOpen) {
         onOpen();
      } else {
         setInternalIsOpen(true);
      }
   }, [onOpen]);

   const handleClose = React.useCallback(() => {
      if (onClose) {
         onClose();
      } else {
         setInternalIsOpen(false);
      }
      onDismiss?.();
   }, [onClose, onDismiss]);

   // Handle body scroll lock
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
         setIsAnimating(true);
      } else {
         document.body.style.overflow = "unset";
         setIsAnimating(false);
      }

      return () => {
         document.body.style.overflow = "unset";
      };
   }, [isOpen]);

   const sizes = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
   };

   // Clone trigger element with click handler
   const triggerWithHandler = React.cloneElement(
      trigger as React.ReactElement<{
         onClick?: (e: React.MouseEvent) => void;
      }>,
      {
         onClick: (e: React.MouseEvent) => {
            // Call original onClick if it exists
            const originalOnClick = (
               trigger as React.ReactElement<{
                  onClick?: (e: React.MouseEvent) => void;
               }>
            ).props?.onClick;
            originalOnClick?.(e);
            handleOpen();
         },
      }
   );

   // Create modal content
   const modalContent = isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         {/* Backdrop */}
         <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
               isAnimating ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
            onClick={closeOnBackdrop ? handleClose : undefined}
         />

         {/* Modal Container */}
         <div
            ref={modalRef}
            className={`relative w-full ${
               sizes[size]
            } max-h-[90vh] flex flex-col transform transition-all duration-300 ${
               isAnimating
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-4"
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
         >
            {/* Background Pattern */}
            <div
               className="absolute inset-0 opacity-5 rounded-3xl"
               style={{
                  backgroundImage: `radial-gradient(var(--utility-color) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
               }}
            />

            {/* Modal Content */}
            <div className="relative bg-white/90 backdrop-blur-md border border-[color-mix(in_srgb,var(--bg-color)_70%,var(--utility-color))] rounded-3xl shadow-2xl shadow-[var(--utility-color)]/10 overflow-hidden flex flex-col h-full">
               {/* Header */}
               {(title || showCloseButton) && (
                  <div className="flex items-center justify-between p-4 px-6 border-b border-[color-mix(in_srgb,var(--bg-color)_80%,var(--utility-color))] flex-shrink-0">
                     {title && (
                        <h2
                           id="modal-title"
                           className="text-xl font-semibold text-[var(--utility-color)]"
                        >
                           {title}
                        </h2>
                     )}

                     {showCloseButton && (
                        <button
                           onClick={handleClose}
                           className="p-2 rounded-full text-[color-mix(in_srgb,var(--text-color)_60%,transparent)] hover:text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--bg-color)_85%,var(--utility-color))] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--utility-color)]/20"
                           aria-label="Close modal"
                        >
                           <X size={20} />
                        </button>
                     )}
                  </div>
               )}

               {/* Body - Scrollable */}
               <div className="p-6 overflow-y-auto flex-1">
                  <div className="text-[var(--text-color)]">{children}</div>
               </div>

               {/* Decorative Elements */}
               <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-[var(--utility-color)]/20 to-transparent rounded-full blur-xl" />
               <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-tl from-[var(--utility-color)]/15 to-transparent rounded-full blur-xl" />

               {/* Shimmer Effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-pulse opacity-30" />
            </div>
         </div>
      </div>
   ) : null;

   return (
      <>
         {triggerWithHandler}

         {/* Portal to body */}
         {isMounted &&
            modalContent &&
            createPortal(modalContent, document.body)}
      </>
   );
}

export default Modal;
