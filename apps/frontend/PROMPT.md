# How to Create This UI Theme System - Complete Guide

## Overview

This document provides a step-by-step guide to recreate this GitLab-inspired minimalist dark mode UI theme system. The focus is on the theming architecture, design system, and UI component patterns - not specific application features.

## Tech Stack

- **React 19** with TypeScript
- **Tailwind CSS v4** (using `@theme` directive)
- **Heroicons** for icons
- **CSS Custom Properties** for theming

## Step 1: Project Setup

### Initialize Project

```bash
# Create Vite + React + TypeScript project
npm create vite@latest frontend -- --template react-ts

# Install dependencies
cd frontend
npm install
npm install @heroicons/react
npm install -D tailwindcss@next @tailwindcss/vite
```

### Configure Vite

```typescript
// vite.config.ts
import {defineConfig} from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(), react(), tsconfigPaths()],
});
```

## Step 2: Setup Tailwind CSS v4 Theme System

### Create Theme System

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* App Colors - Dark Mode */
  --color-app-bg: #272727;
  --color-app-surface: #2d2d2d;
  --color-app-border: #3d3d3d;
  --color-app-hover: #353535;
  --color-app-accent: #4285f4;
  --color-app-accent-hover: #5a95f5;

  /* Semantic Colors */
  --color-success: #34a853;
  --color-warning: #fbbc04;
  --color-error: #ea4335;
  --color-info: #4285f4;

  /* Text Colors */
  --color-text-primary: #e8e8e8;
  --color-text-secondary: #b0b0b0;
  --color-text-tertiary: #808080;

  /* Fonts */
  --font-family-sans: "Inter", "Roboto", "Source Sans 3", "Segoe UI", sans-serif;
  --font-family-mono: "JetBrains Mono", "Fira Code", "Consolas", monospace;
}

/* Global Styles */
* {
  font-family: var(--font-family-sans);
  font-weight: 400;
}

body {
  background-color: var(--color-app-bg);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: var(--color-app-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-tertiary);
}

::-webkit-scrollbar-track {
  background-color: var(--color-app-bg);
}

/* Focus Styles */
*:focus-visible {
  outline: 2px solid var(--color-app-accent);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Selection */
::selection {
  background-color: var(--color-app-accent);
  color: var(--color-text-primary);
}
```

## Step 3: Color System Architecture

### Color Categories

#### **App Colors** (Core UI Colors)

- `app-bg`: Main background (#272727)
- `app-surface`: Card/surface background (#2d2d2d)
- `app-border`: Border color (#3d3d3d)
- `app-hover`: Hover state background (#353535)
- `app-accent`: Primary accent color (#4285f4)
- `app-accent-hover`: Accent hover state (#5a95f5)

#### **Semantic Colors** (Status/State Colors)

- `success`: Success/green (#34a853)
- `warning`: Warning/yellow (#fbbc04)
- `error`: Error/red (#ea4335)
- `info`: Info/blue (#4285f4)

#### **Text Colors** (Typography Hierarchy)

- `text-primary`: Primary text (#e8e8e8)
- `text-secondary`: Secondary text (#b0b0b0)
- `text-tertiary`: Tertiary/muted text (#808080)

### Usage Pattern

```tsx
// Backgrounds
<div className="bg-app-bg">          {/* Main background */}
<div className="bg-app-surface">     {/* Card background */}
<div className="bg-app-hover">       {/* Hover state */}

// Text
<p className="text-text-primary">    {/* Main text */}
<span className="text-text-secondary"> {/* Secondary text */}
<small className="text-text-tertiary"> {/* Muted text */}

// Borders
<div className="border border-app-border"> {/* Standard border */}

// Accent
<button className="bg-app-accent text-white"> {/* Primary action */}
<span className="text-app-accent"> {/* Accent text */}

// Semantic
<div className="bg-success/10 text-success border-success/30"> {/* Success state */}
<div className="bg-error/10 text-error border-error/30"> {/* Error state */}
```

## Step 4: Layout Components

### Header Component Pattern

```tsx
// src/components/layout/Header.tsx
import {useState} from "react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";

export const Header: React.FC<{actions?: React.ReactNode}> = ({actions}) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-14 bg-app-surface border-b border-app-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      {/* Logo Section */}
      <div className="flex flex-col flex-shrink-0">
        <h1 className="text-base font-semibold text-text-primary">
          App<span className="text-app-accent">Name</span>
        </h1>
        <span className="hidden sm:inline text-xs text-text-tertiary">
          Subtitle
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {/* Search */}
        <form className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-40 lg:w-56 pl-8 pr-3 bg-app-bg border border-app-border rounded text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors"
          />
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        </form>
      </div>
    </header>
  );
};
```

### Sidebar Component Pattern

```tsx
// src/components/layout/Sidebar.tsx
import {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {Bars3Icon, ChevronLeftIcon} from "@heroicons/react/24/outline";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{className?: string}>;
  path: string;
}

export const Sidebar: React.FC<{items: NavItem[]}> = ({items}) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={`bg-app-surface border-r border-app-border transition-all duration-300 flex flex-col ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Collapse Button */}
      <div className="h-14 flex items-center justify-end px-4 border-b border-app-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-app-hover rounded transition-colors"
        >
          {collapsed ? (
            <Bars3Icon className="w-5 h-5 text-text-secondary" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-text-secondary" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors relative group ${
                isActive
                  ? "text-app-accent bg-app-accent/10 border-l-2 border-app-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-app-hover"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1.5 bg-app-surface border border-app-border text-text-primary text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
```

### MainLayout Component Pattern

```tsx
// src/components/layout/MainLayout.tsx
import {ReactNode} from "react";
import {Sidebar} from "./Sidebar";
import {Header} from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
  headerActions?: ReactNode;
  sidebarItems?: NavItem[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  rightSidebar,
  headerActions,
  sidebarItems = [],
}) => {
  return (
    <div className="h-screen flex flex-col bg-app-bg">
      <Header actions={headerActions} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 overflow-auto bg-app-bg">
          <div className="px-8 py-6 h-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
        {rightSidebar && (
          <aside className="w-72 bg-app-surface border-l border-app-border overflow-auto">
            <div className="p-5">{rightSidebar}</div>
          </aside>
        )}
      </div>
    </div>
  );
};
```

## Step 5: Core UI Components

### Button Component

```tsx
// src/components/ui/Button.tsx
import {ButtonHTMLAttributes, ReactNode} from "react";

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
      "bg-app-accent text-white border-app-accent hover:bg-app-accent-hover hover:border-app-accent-hover shadow-sm active:scale-[0.98]",
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
```

### Input Component

```tsx
// src/components/ui/Input.tsx
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
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`h-8 w-full px-3 bg-app-surface border border-app-border rounded text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors ${
            error ? "border-error focus:ring-error focus:border-error" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
```

### Modal Component

```tsx
// src/components/ui/Modal.tsx
import {ReactNode, useEffect} from "react";
import {XMarkIcon} from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`${sizeClasses[size]} w-full bg-app-surface border border-app-border rounded-lg shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-app-hover rounded transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 px-6 py-4 border-t border-app-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
```

### Badge Component

```tsx
// src/components/ui/Badge.tsx
import {ReactNode} from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "neutral" | "primary";
  size?: "sm" | "md";
  children: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  size = "md",
  children,
  className = "",
}) => {
  const variantStyles = {
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    error: "bg-error/15 text-error border-error/30",
    info: "bg-info/15 text-info border-info/30",
    neutral: "bg-app-surface text-text-secondary border-app-border",
    primary: "bg-app-accent/15 text-app-accent border-app-accent/30",
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center rounded border font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
```

### Alert Component

```tsx
// src/components/ui/Alert.tsx
import {ReactNode} from "react";

interface AlertProps {
  variant?: "success" | "warning" | "error" | "info";
  children: ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  children,
  className = "",
}) => {
  const variantStyles = {
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    error: "bg-error/10 text-error border-error/30",
    info: "bg-info/10 text-info border-info/30",
  };

  return (
    <div
      className={`rounded border p-4 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
};
```

### Card Component

```tsx
// src/components/ui/Card.tsx
import {ReactNode} from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  headerActions?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = "",
  headerActions,
}) => {
  return (
    <div
      className={`bg-app-surface border border-app-border rounded-lg p-6 ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
```

## Step 6: Design Principles

### Color Usage Rules

1. **Backgrounds**:

   - `bg-app-bg` - Main page background
   - `bg-app-surface` - Cards, panels, elevated surfaces
   - `bg-app-hover` - Hover states on interactive elements

2. **Borders**:

   - Always use `border-app-border` for consistency
   - Use `border-transparent` when you want no visible border but maintain spacing

3. **Text Hierarchy**:

   - `text-text-primary` - Main content, headings
   - `text-text-secondary` - Labels, descriptions
   - `text-text-tertiary` - Placeholders, muted text

4. **Interactive States**:

   - Hover: `hover:bg-app-hover`
   - Active: `active:scale-[0.98]` for buttons
   - Focus: `focus:ring-2 focus:ring-app-accent/50`

5. **Semantic Colors**:
   - Success: `bg-success/10 text-success border-success/30`
   - Error: `bg-error/10 text-error border-error/30`
   - Warning: `bg-warning/10 text-warning border-warning/30`
   - Info: `bg-info/10 text-info border-info/30`

### Spacing System

- **Padding Scale**: `p-2`, `p-3`, `p-4`, `p-6` (most common)
- **Gap Scale**: `gap-2`, `gap-3`, `gap-4`, `gap-6`
- **Margin Scale**: `mb-4`, `mb-6` for sections
- **Card Padding**: `p-6` standard, `p-4` for compact
- **Button Padding**: `px-4 py-2` (md), `px-3 py-1.5` (sm)

### Typography System

```tsx
// Headings
<h1 className="text-xl sm:text-2xl font-semibold text-text-primary">
<h2 className="text-lg font-semibold text-text-primary">
<h3 className="text-base font-semibold text-text-primary">

// Body Text
<p className="text-sm text-text-primary">
<p className="text-base text-text-primary">

// Labels
<label className="text-sm font-medium text-text-primary">
<span className="text-xs uppercase tracking-wider text-text-tertiary">

// Monospace (for code, hashes, etc.)
<code className="font-mono text-sm text-app-accent">
```

### Component Patterns

#### Card Pattern

```tsx
<div className="bg-app-surface border border-app-border rounded-lg p-6">
  <h2 className="text-lg font-semibold text-text-primary mb-4">Title</h2>
  {/* Content */}
</div>
```

#### List Item Pattern

```tsx
<div className="p-3 rounded border border-transparent hover:bg-app-hover hover:border-app-border transition-colors">
  {/* List item content */}
</div>
```

#### Stat Card Pattern

```tsx
<div className="bg-app-surface border border-app-border rounded-lg p-4">
  <div className="flex items-center gap-3">
    <div className="p-2 bg-app-accent/10 rounded">
      <Icon className="w-5 h-5 text-app-accent" />
    </div>
    <div>
      <p className="text-xs text-text-tertiary uppercase tracking-wider">
        Label
      </p>
      <p className="text-2xl font-semibold text-text-primary">Value</p>
    </div>
  </div>
</div>
```

## Step 7: Responsive Design Patterns

### Breakpoints

- `sm:` - 640px and up (tablets)
- `md:` - 768px and up
- `lg:` - 1024px and up (desktops)
- `xl:` - 1280px and up

### Common Responsive Patterns

```tsx
// Responsive Text Sizing
<h1 className="text-xl sm:text-2xl">Title</h1>

// Responsive Layout Direction
<div className="flex flex-col sm:flex-row gap-3">

// Responsive Visibility
<span className="hidden sm:inline">Desktop Text</span>
<span className="sm:hidden">Mobile Text</span>

// Responsive Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive Padding
<div className="px-4 sm:px-6 lg:px-8">

// Responsive Width
<div className="w-full sm:w-auto">
```

## Step 8: Interactive States

### Hover States

```tsx
// Buttons
<button className="hover:bg-app-hover transition-colors">

// Links
<a className="hover:text-app-accent transition-colors">

// Cards
<div className="hover:bg-app-hover hover:border-app-border transition-colors">
```

### Active States

```tsx
// Buttons with scale effect
<button className="active:scale-[0.98] transition-transform">
```

### Focus States

```tsx
// Inputs
<input className="focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent">

// Buttons
<button className="focus:outline-none focus:ring-2 focus:ring-app-accent/50">
```

### Disabled States

```tsx
<button className="disabled:opacity-50 disabled:cursor-not-allowed">
```

## Step 9: Opacity Modifiers

Use Tailwind's opacity syntax for subtle backgrounds:

```tsx
// 10% opacity backgrounds
<div className="bg-app-accent/10">     {/* Light accent background */}
<div className="bg-success/10">       {/* Light success background */}
<div className="bg-error/10">         {/* Light error background */}

// 30% opacity borders
<div className="border-app-accent/30"> {/* Subtle accent border */}
<div className="border-error/30">     {/* Subtle error border */}

// 50% opacity for focus rings
<div className="focus:ring-app-accent/50">
```

## Step 10: Transitions and Animations

### Standard Transitions

```tsx
// Color transitions
<div className="transition-colors">

// All properties
<div className="transition-all">

// Transform transitions
<button className="transition-transform active:scale-[0.98]">
```

### Duration

```tsx
// Default (150ms)
<div className="transition-colors">

// Custom duration
<div className="transition-all duration-300">
```

## Step 11: Creating Theme Variants

### Light Mode Theme

```css
/* Add to index.css */
.light-theme {
  --color-app-bg: #ffffff;
  --color-app-surface: #f5f5f5;
  --color-app-border: #e5e5e5;
  --color-app-hover: #eeeeee;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #4a4a4a;
  --color-text-tertiary: #808080;
}
```

### Theme Toggle

```tsx
// Theme toggle component
const [isDark, setIsDark] = useState(true);

useEffect(() => {
  document.documentElement.classList.toggle("light-theme", !isDark);
}, [isDark]);
```

## Step 12: Best Practices

### ✅ DO

1. **Use theme utility classes**:

   ```tsx
   <div className="bg-app-surface text-text-primary border-app-border">
   ```

2. **Maintain consistency**:

   - Same spacing patterns
   - Same border radius (`rounded`, `rounded-lg`)
   - Same transition durations

3. **Use semantic colors** for status:

   ```tsx
   <Badge variant="success">Success</Badge>
   <Alert variant="error">Error</Alert>
   ```

4. **Leverage opacity modifiers**:
   ```tsx
   <div className="bg-app-accent/10 border-app-accent/30">
   ```

### ❌ DON'T

1. **Don't hardcode hex values**:

   ```tsx
   // Bad
   <div className="bg-[#272727]">

   // Good
   <div className="bg-app-bg">
   ```

2. **Don't mix color systems**:

   ```tsx
   // Bad
   <div className="bg-app-surface text-[#e8e8e8]">

   // Good
   <div className="bg-app-surface text-text-primary">
   ```

3. **Don't skip hover states** on interactive elements

4. **Don't forget focus states** for accessibility

## Summary

This UI theme system provides:

- **Consistent Color System**: Centralized theme colors via CSS variables
- **Component Library**: Reusable UI components with consistent styling
- **Responsive Design**: Mobile-first approach with breakpoints
- **Accessibility**: Proper focus states and semantic HTML
- **Dark Mode First**: Optimized for dark backgrounds
- **GitLab-Inspired**: Minimalist, clean aesthetic

The key principles:

1. Use theme utility classes (`bg-app-surface`, `text-text-primary`)
2. Maintain consistent spacing and typography
3. Apply hover and focus states to all interactive elements
4. Use semantic colors for status/state indicators
5. Leverage opacity modifiers for subtle effects

This creates a cohesive, professional UI that's easy to maintain and extend.
