'use client';

import { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import ResultsTable from '@/components/ResultsTable';
import ExportButton from '@/components/ExportButton';
import ThemeToggle from '@/components/ThemeToggle';
import { ReceiptLine, ExtractionResult } from '@/lib/types';

export default function Home() {
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    let totalLinesExtracted = 0;
    const newLines: ReceiptLine[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setSuccessMessage(`Bearbetar fil ${i + 1} av ${files.length}: ${file.name}...`);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/extract', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Fel vid bearbetning av ${file.name}: ${errorData.error || 'Unknown error'}`);
        }

        const result: ExtractionResult = await response.json();
        newLines.push(...result.lines);
        totalLinesExtracted += result.lines.length;
      }

      setLines(prevLines => [...prevLines, ...newLines]);
      setSuccessMessage(`Lyckades extrahera ${totalLinesExtracted} rad(er) från ${files.length} kvitto(n)!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid bearbetning av kvitton');
      console.error('Error processing receipts:', err);
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            MacEasy - Receipt OCR
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ladda upp dina kvitton och låt AI:n extrahera information för Maconomy-import
          </p>
        </div>

        {/* Upload Zone */}
        <div className="mb-8">
          <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <div>
                <p className="text-blue-900 dark:text-blue-200 font-medium">Bearbetar kvitto...</p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">Detta kan ta några sekunder</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {lines.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Extraherad Data
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Rensa
                </button>
                <ExportButton lines={lines} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sammanfattning</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Antal rader</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{lines.length}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total summa</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                    {lines.reduce((sum, line) => sum + line.amount, 0).toFixed(2)} {lines[0]?.currency || 'SEK'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {lines.length === 0 && !isProcessing && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Hur det fungerar</h3>
            <ol className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-semibold mr-3">
                  1
                </span>
                <span>Ladda upp ett eller flera kvitton som PDF eller bild (JPG, PNG)</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-semibold mr-3">
                  2
                </span>
                <span>Vänta medan AI:n analyserar och extraherar information</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-semibold mr-3">
                  3
                </span>
                <span>Granska och redigera den extraherade datan i tabellen</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-semibold mr-3">
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

