import { useState } from 'react';
import { importExportService, type ImportResult } from '../services/import-export.service';

export function ImportExportPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);
      setImportResult(null);

      const result = await importExportService.importCSV(file);
      setImportResult(result);

      // Reset file input
      event.target.value = '';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import transactions');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);

      const blob = await importExportService.exportCSV(dateRange.startDate, dateRange.endDate);
      const filename = `transactions_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
      importExportService.downloadCSV(blob, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export transactions');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import & Export</h1>
        <p className="mt-1 text-sm text-gray-500">
          Import transactions from CSV or export your data
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Import Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Import Transactions</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file with your transactions. The file should include columns for Date, Description, Amount, Type, Account, and Category.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">CSV Format Guide:</h3>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li><strong>Date:</strong> 2024-01-15, 01/15/2024, or 15/01/2024</li>
                <li><strong>Description:</strong> Transaction description</li>
                <li><strong>Amount:</strong> Positive number (e.g., 50.00 or $50.00)</li>
                <li><strong>Type:</strong> INCOME, EXPENSE, or TRANSFER</li>
                <li><strong>Account:</strong> Name of your account (must exist)</li>
                <li><strong>Category:</strong> Category name (optional)</li>
                <li><strong>Notes:</strong> Additional notes (optional)</li>
                <li><strong>Reference:</strong> Reference number (optional)</li>
              </ul>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={importing}
              />
            </label>

            {importing && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Importing transactions...</p>
              </div>
            )}

            {importResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-900 mb-2">Import Complete!</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                  <div>Total Records: <span className="font-semibold">{importResult.totalRecords}</span></div>
                  <div>Successful: <span className="font-semibold">{importResult.successfulImports}</span></div>
                  <div>Duplicates Skipped: <span className="font-semibold">{importResult.duplicatesSkipped}</span></div>
                  <div>Errors: <span className="font-semibold">{importResult.errors}</span></div>
                </div>
                <p className="mt-2 text-xs text-green-700">{importResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Export Transactions</h2>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Export your transactions to a CSV file for backup or analysis.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export to CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sample CSV Download */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900">Need a sample CSV file?</h3>
            <p className="text-xs text-blue-700 mt-1">
              Download a sample CSV file to see the correct format for importing transactions.
            </p>
            <button
              onClick={() => {
                const sample = 'Date,Description,Amount,Type,Account,Category,Notes,Reference\n2024-01-15,Grocery Shopping,50.00,EXPENSE,Checking,Groceries,Weekly groceries,REF001\n2024-01-16,Salary,3000.00,INCOME,Checking,Salary,Monthly salary,SAL001';
                const blob = new Blob([sample], { type: 'text/csv' });
                importExportService.downloadCSV(blob, 'sample_transactions.csv');
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Download Sample CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
