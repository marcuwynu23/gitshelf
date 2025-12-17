import {InputHTMLAttributes, forwardRef} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({label, error, helperText, className = "", ...props}, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#e8e8e8] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`h-8 w-full px-3 bg-app-surface border border-[#3d3d3d] rounded text-sm text-[#e8e8e8] placeholder-[#808080] focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors ${
            error ? "border-error focus:ring-error focus:border-error" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-[#808080]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
