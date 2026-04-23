import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useExport } from '@/constants/export-context';
import { Download } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cell?: (value: any, row: T) => React.ReactNode;
  }[];
  title?: string;
  description?: string;
  filename?: string;
}

export function DataTable<T>({
  data,
  columns,
  title = 'Data Table',
  description,
  filename = 'table-data.csv'
}: DataTableProps<T>) {
  const { exportToCsv } = useExport();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    // Format data for CSV export
    const exportData = data.map(row => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedRow: Record<string, any> = {};
      columns.forEach(column => {
        formattedRow[column.header] = row[column.accessorKey];
      });
      return formattedRow;
    });

    exportToCsv(exportData, filename);
    setIsExporting(false);
  };

  return (
    <div className="bg-gradient-card rounded-xl border border-glass-border shadow-glass overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-glass-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-secondary/20 transition-colors">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-sm">
                    {column.cell
                      ? column.cell(row[column.accessorKey], row)
                      : row[column.accessorKey] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-sm text-muted-foreground"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}