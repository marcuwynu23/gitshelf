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
  const baseStyles =
    "font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-app-accent/40 rounded-md";

  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-sm",
  };

  const variantStyles = {
    primary: "bg-app-accent text-text-on-accent hover:bg-app-accent-hover",
    secondary: "bg-app-surface text-text-primary hover:bg-app-surface-hover",
    tertiary:
      "text-text-secondary hover:text-text-primary hover:bg-app-surface/50",
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
