import {XMarkIcon} from "@heroicons/react/24/outline";
import React, {type ReactNode, useCallback, useEffect} from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "half";
  closeOnBackdrop?: boolean; // ✅ opt-in
  closeOnEscape?: boolean; // ✅ opt-in/out
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = false,
  closeOnEscape = true,
}) => {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!closeOnEscape) return;
      if (e.key === "Escape") onClose();
    },
    [closeOnEscape, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onKeyDown]);

  if (!isOpen) return null;

  const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    half: "max-w-[50vw]",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onPointerDown={(e) => {
        if (!closeOnBackdrop) return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${sizeClasses[size]} w-full  h-150 bg-app-surface border border-[#3d3d3d] rounded-lg shadow-2xl`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#3d3d3d]">
            <h2 className="text-lg font-semibold text-[#e8e8e8]">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#353535] rounded transition-colors"
              aria-label="Close"
              type="button"
            >
              <XMarkIcon className="w-5 h-5 text-[#b0b0b0]" />
            </button>
          </div>
        )}

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 px-6 py-4 border-t border-[#3d3d3d]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
