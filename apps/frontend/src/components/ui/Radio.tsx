import {InputHTMLAttributes, forwardRef} from "react";

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({label, className = "", ...props}, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="radio"
          className={`w-4 h-4 border-[#3d3d3d] bg-app-surface text-app-accent focus:ring-2 focus:ring-app-accent/50 focus:ring-offset-0 ${className}`}
          {...props}
        />
        {label && <span className="text-sm text-[#b0b0b0]">{label}</span>}
      </label>
    );
  }
);

Radio.displayName = "Radio";
