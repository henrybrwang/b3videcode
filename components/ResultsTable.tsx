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

  const handleQuantityOrPriceChange = (id: string, field: 'quantity' | 'unitPrice', value: number) => {
    const line = lines.find(l => l.id === id);
    if (!line) return;

    const newQuantity = field === 'quantity' ? value : line.quantity;
    const newUnitPrice = field === 'unitPrice' ? value : line.unitPrice;
    const newAmount = newQuantity * newUnitPrice;

    onUpdateLine(id, {
      [field]: value,
      amount: Math.round(newAmount * 100) / 100,
    });
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
              Filnamn
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uppgift
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Beskrivning
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Antal
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Styckpris
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valuta
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Moms %
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Belopp
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
                  className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {line.fileName}
              </td>
              <td className="px-4 py-3">
                <select
                  value={line.task}
                  onChange={(e) => handleCellChange(line.id, 'task', e.target.value)}
                  className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MACONOMY_CATEGORIES.map((cat) => (
                    <option key={cat.code} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={line.description || ''}
                  onChange={(e) => handleCellChange(line.id, 'description', e.target.value)}
                  className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Beskrivning"
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <input
                  type="number"
                  value={line.quantity}
                  onChange={(e) => handleQuantityOrPriceChange(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  className="w-20 px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <input
                  type="number"
                  value={line.unitPrice}
                  onChange={(e) => handleQuantityOrPriceChange(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  className="w-24 px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <select
                  value={line.currency}
                  onChange={(e) => handleCellChange(line.id, 'currency', e.target.value)}
                  className="w-20 px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={line.taxCode}
                  onChange={(e) => handleCellChange(line.id, 'taxCode', parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-20 px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                {line.amount.toFixed(2)}
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
