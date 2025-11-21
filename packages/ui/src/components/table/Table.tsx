// packages/ui/src/Table.tsx
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
      <p className={`text-gray-500 italic ${className}`}>{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
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
