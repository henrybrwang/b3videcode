'use client';

import { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import ResultsTable from '@/components/ResultsTable';
import ExportButton from '@/components/ExportButton';
import { ReceiptLine, ExtractionResult } from '@/lib/types';

export default function Home() {
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process receipt');
      }

      const result: ExtractionResult = await response.json();
      setLines(result.lines);
      setSuccessMessage(`Lyckades extrahera ${result.lines.length} rad(er) från kvittot!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid bearbetning av kvittot');
      console.error('Error processing receipt:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateLine = (id: string, updates: Partial<ReceiptLine>) => {
    setLines(prevLines =>
      prevLines.map(line =>
        line.id === id ? { ...line, ...updates } : line
      )
    );
  };

  const handleDeleteLine = (id: string) => {
    setLines(prevLines => prevLines.filter(line => line.id !== id));
  };

  const handleReset = () => {
    setLines([]);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MacEasy - Receipt OCR
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ladda upp ett kvitto och låt AI:n extrahera information för Maconomy-import
          </p>
        </div>

        {/* Upload Zone */}
        <div className="mb-8">
          <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-blue-900 font-medium">Bearbetar kvitto...</p>
                <p className="text-blue-700 text-sm">Detta kan ta några sekunder</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {lines.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Extraherad Data
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Rensa
                </button>
                <ExportButton lines={lines} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-sm text-gray-600 mb-4">
                Granska och redigera informationen nedan innan du exporterar till CSV.
                Klicka i fälten för att ändra värden.
              </p>
              <ResultsTable
                lines={lines}
                onUpdateLine={handleUpdateLine}
                onDeleteLine={handleDeleteLine}
              />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sammanfattning</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Antal rader</p>
                  <p className="text-2xl font-bold text-blue-900">{lines.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total summa (inkl. moms)</p>
                  <p className="text-2xl font-bold text-green-900">
                    {lines.reduce((sum, line) => sum + line.amount, 0).toFixed(2)} {lines[0]?.currency || 'SEK'}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Total summa (exkl. moms)</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {lines.reduce((sum, line) => sum + line.amountExclVat, 0).toFixed(2)} {lines[0]?.currency || 'SEK'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {lines.length === 0 && !isProcessing && (
          <div className="mt-12 bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Hur det fungerar</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold mr-3">
                  1
                </span>
                <span>Ladda upp ett kvitto som PDF eller bild (JPG, PNG)</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold mr-3">
                  2
                </span>
                <span>Vänta medan AI:n analyserar och extraherar information</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold mr-3">
                  3
                </span>
                <span>Granska och redigera den extraherade datan i tabellen</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-semibold mr-3">
                  4
                </span>
                <span>Exportera till CSV för import i Maconomy</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}

