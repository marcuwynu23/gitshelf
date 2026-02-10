import {ReactNode} from "react";

interface TableProps<T> {
  items: T[];
  columns: {header: string; render: (item: T) => ReactNode}[];
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  items,
  columns,
  emptyMessage = "No items found.",
  className = "",
}: TableProps<T>) {
  if (!items || items.length === 0) {
    return (
      <p className={`text-text-tertiary italic ${className}`}>{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto bg-app-surface rounded-lg">
      <table className={`min-w-full ${className}`}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-app-hover transition-colors duration-200"
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-text-primary"
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
