'use client';

import { ReceiptLine } from '@/lib/types';
import { MACONOMY_CATEGORIES, formatCategoryOption } from '@/lib/categories';

interface ResultsTableProps {
  lines: ReceiptLine[];
  onUpdateLine: (id: string, updates: Partial<ReceiptLine>) => void;
  onDeleteLine: (id: string) => void;
}

export default function ResultsTable({ lines, onUpdateLine, onDeleteLine }: ResultsTableProps) {
  if (lines.length === 0) {
    return null;
  }

  const handleCellChange = (id: string, field: keyof ReceiptLine, value: any) => {
    onUpdateLine(id, { [field]: value });
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Datum
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Leverantör
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Beskrivning
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Belopp (inkl. moms)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valuta
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Moms %
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Belopp (exkl. moms)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Inrikes
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kategori
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Åtgärd
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lines.map((line) => (
            <tr key={line.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <input
                  type="date"
                  value={line.date}
                  onChange={(e) => handleCellChange(line.id, 'date', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={line.supplier}
                  onChange={(e) => handleCellChange(line.id, 'supplier', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={line.description || ''}
                  onChange={(e) => handleCellChange(line.id, 'description', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Beskrivning"
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <input
                  type="number"
                  value={line.amount}
                  onChange={(e) => {
                    const amount = parseFloat(e.target.value);
                    const amountExclVat = amount / (1 + line.vatRate / 100);
                    handleCellChange(line.id, 'amount', amount);
                    handleCellChange(line.id, 'amountExclVat', Math.round(amountExclVat * 100) / 100);
                  }}
                  step="0.01"
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <select
                  value={line.currency}
                  onChange={(e) => handleCellChange(line.id, 'currency', e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SEK">SEK</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="NOK">NOK</option>
                  <option value="DKK">DKK</option>
                </select>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <input
                  type="number"
                  value={line.vatRate}
                  onChange={(e) => {
                    const vatRate = parseFloat(e.target.value);
                    const amountExclVat = line.amount / (1 + vatRate / 100);
                    handleCellChange(line.id, 'vatRate', vatRate);
                    handleCellChange(line.id, 'amountExclVat', Math.round(amountExclVat * 100) / 100);
                  }}
                  step="0.01"
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {line.amountExclVat.toFixed(2)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={line.isDomestic}
                  onChange={(e) => handleCellChange(line.id, 'isDomestic', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3">
                <select
                  value={line.category}
                  onChange={(e) => handleCellChange(line.id, 'category', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MACONOMY_CATEGORIES.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {formatCategoryOption(cat)}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <button
                  onClick={() => onDeleteLine(line.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                  title="Ta bort rad"
                >
                  Ta bort
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

