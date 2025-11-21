'use client';

import { ReceiptLine } from '@/lib/types';
import Papa from 'papaparse';

interface ExportButtonProps {
  lines: ReceiptLine[];
  disabled?: boolean;
}

export default function ExportButton({ lines, disabled = false }: ExportButtonProps) {
  const handleExport = () => {
    if (lines.length === 0) return;

    // Prepare data for CSV export in Maconomy format
    const csvData = lines.map(line => ({
      Datum: line.date,
      Leverantör: line.supplier,
      Beskrivning: line.description || '',
      'Belopp inkl. moms': line.amount.toFixed(2),
      Valuta: line.currency,
      'Momssats (%)': line.vatRate.toFixed(2),
      'Belopp exkl. moms': line.amountExclVat.toFixed(2),
      Inrikes: line.isDomestic ? 'Ja' : 'Nej',
      Kategori: line.category,
    }));

    // Convert to CSV
    const csv = Papa.unparse(csvData, {
      delimiter: ';',
      header: true,
    });

    // Create download link
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `maconomy_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || lines.length === 0}
      className={`
        px-6 py-3 rounded-lg font-medium text-white transition-colors
        ${disabled || lines.length === 0
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
        }
      `}
    >
      <div className="flex items-center space-x-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>Exportera till CSV</span>
      </div>
    </button>
  );
}

