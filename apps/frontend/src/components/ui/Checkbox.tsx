import {InputHTMLAttributes, forwardRef} from "react";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({label, className = "", ...props}, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={`w-4 h-4 rounded border-[#3d3d3d] bg-app-surface text-app-accent focus:ring-2 focus:ring-app-accent/50 focus:ring-offset-0 ${className}`}
          {...props}
        />
        {label && <span className="text-sm text-[#b0b0b0]">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
