import {ButtonHTMLAttributes, ReactNode} from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#05df72]/40 rounded-md";
  
  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-sm",
  };

  const variantStyles = {
    primary: "bg-[#05df72] text-[#181818] hover:bg-[#05df72]/90",
    secondary: "bg-[#1f1f1f] text-white hover:bg-[#181818]",
    tertiary: "text-white/70 hover:text-white hover:bg-[#1f1f1f]/50",
    danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
