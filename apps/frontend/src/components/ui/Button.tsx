import type {ButtonHTMLAttributes, ReactNode} from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-app-accent/50 rounded border whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "h-7 px-3 text-xs",
    md: "h-8 px-4 text-sm",
    lg: "h-9 px-5 text-sm",
  };

  const variantStyles = {
    primary:
      "bg-app-accent text-white border-app-accent hover:bg-[#5a95f5] hover:border-[#5a95f5] shadow-sm active:scale-[0.98]",
    secondary:
      "bg-app-surface text-[#e8e8e8] border-[#3d3d3d] hover:bg-[#353535] hover:border-[#3d3d3d] active:scale-[0.98]",
    tertiary:
      "bg-transparent text-[#b0b0b0] border-transparent hover:text-[#e8e8e8] hover:bg-[#353535] active:scale-[0.98]",
    danger:
      "bg-error/10 text-error border-error/30 hover:bg-error/20 hover:border-error/40 active:scale-[0.98]",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
