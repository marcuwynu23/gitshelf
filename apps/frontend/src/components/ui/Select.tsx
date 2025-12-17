import {useState, useRef, useEffect} from "react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  error,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-[#e8e8e8] mb-1.5">
          {label}
        </label>
      )}
      <div ref={selectRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-8 w-full px-3 bg-app-surface border border-[#3d3d3d] rounded text-sm text-[#e8e8e8] flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-app-accent focus:border-app-accent transition-colors ${
            error ? "border-error focus:ring-error focus:border-error" : ""
          }`}
        >
          <span
            className={selectedOption ? "text-[#e8e8e8]" : "text-[#808080]"}
          >
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDownIcon
            className={`w-4 h-4 text-[#808080] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-app-surface border border-[#3d3d3d] rounded shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  value === option.value
                    ? "bg-app-accent/15 text-app-accent"
                    : "text-[#b0b0b0] hover:text-[#e8e8e8] hover:bg-[#353535]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
};
