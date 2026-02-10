import {XMarkIcon} from "@heroicons/react/24/outline";
import React, {type ReactNode, useCallback, useEffect} from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "half";
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  /**
   * Constrains the overall modal height so inner content can scroll.
   * Defaults to 80vh which behaves well across screens.
   */
  maxHeightClass?: string;
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
  maxHeightClass = "max-h-[80vh]",
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
    half: "max-w-full sm:max-w-[90vw] lg:max-w-[50vw] h-full sm:h-auto",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onPointerDown={(e) => {
        if (!closeOnBackdrop) return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[
          sizeClasses[size],
          "w-full",
          maxHeightClass,
          "flex flex-col", // ✅ critical
          "bg-app-surface border border-app-border rounded-lg shadow-2xl",
          "overflow-hidden", // ✅ ensures body becomes the scroll container
        ].join(" ")}
        data-testid="modal-container"
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-app-hover rounded transition-colors"
              aria-label="Close"
              type="button"
            >
              <XMarkIcon className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        )}

        {/* ✅ This is now the scrollable area */}
        <div
          className="px-6 py-5 flex-1 overflow-y-auto"
          data-testid="modal-body"
        >
          {children}
        </div>

        {footer && (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 px-6 py-4 border-t border-app-border flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
