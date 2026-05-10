'use client';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const Table = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
}: TableProps) => {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={`${rowIndex}-${col.key}`}
                  className="border border-gray-300 px-4 py-3 text-gray-800"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
