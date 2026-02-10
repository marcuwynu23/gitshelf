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
      "bg-app-accent text-text-on-accent border-app-accent hover:bg-app-accent-hover hover:border-app-accent-hover shadow-sm active:scale-[0.98]",
    secondary:
      "bg-app-surface text-text-primary border-app-border hover:bg-app-hover hover:border-app-border active:scale-[0.98]",
    tertiary:
      "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-app-hover active:scale-[0.98]",
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
