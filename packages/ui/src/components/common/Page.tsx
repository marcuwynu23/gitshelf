import {HTMLAttributes, ReactNode} from "react";

interface PageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Page({className = "", children, ...props}: PageProps) {
  return (
    <div className={`min-h-screen bg-app-bg ${className}`} {...props}>
      {children}
    </div>
  );
}
