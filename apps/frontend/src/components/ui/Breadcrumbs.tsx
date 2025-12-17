import {Link} from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({items}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-xs sm:text-sm mb-4">
      {items.map((crumb, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <span className="text-[#808080]">/</span>}
          {crumb.href ? (
            <Link
              to={crumb.href}
              className={`text-[#b0b0b0] hover:text-[#e8e8e8] transition-colors ${
                idx === items.length - 1
                  ? "text-[#e8e8e8] font-medium cursor-default pointer-events-none"
                  : "cursor-pointer"
              }`}
            >
              {crumb.label}
            </Link>
          ) : crumb.onClick ? (
            <button
              onClick={crumb.onClick}
              className={`text-[#b0b0b0] hover:text-[#e8e8e8] transition-colors ${
                idx === items.length - 1
                  ? "text-[#e8e8e8] font-medium cursor-default"
                  : "cursor-pointer"
              }`}
            >
              {crumb.label}
            </button>
          ) : (
            <span
              className={
                idx === items.length - 1
                  ? "text-[#e8e8e8] font-medium"
                  : "text-[#b0b0b0]"
              }
            >
              {crumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
