import { useState } from 'react';
import { importExportService, type ImportResult } from '../services/import-export.service';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Loader2
} from 'lucide-react';

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
      event.target.value = '';
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to import transactions');
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
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to export transactions');
    } finally {
      setExporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = 'Date,Description,Amount,Type,Account,Category,Notes,Reference\n2024-01-15,Grocery Shopping,50.00,EXPENSE,Checking,Groceries,Weekly groceries,REF001\n2024-01-16,Salary,3000.00,INCOME,Checking,Salary,Monthly salary,SAL001';
    const blob = new Blob([sample], { type: 'text/csv' });
    importExportService.downloadCSV(blob, 'sample_transactions.csv');
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-gray-900">Import & Export</h2>
        <p className="text-sm text-gray-500 mt-1">Import transactions from CSV or export your data</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 font-bold">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Upload className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Import Transactions</h3>
          </div>
          
          <div className="p-5 space-y-4">
            {/* Format Guide */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700 text-sm">CSV Format</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><strong>Date:</strong> YYYY-MM-DD or MM/DD/YYYY</li>
                <li><strong>Type:</strong> INCOME, EXPENSE, or TRANSFER</li>
                <li><strong>Account:</strong> Account name (must exist)</li>
              </ul>
            </div>

            {/* Upload Area */}
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              importing ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}>
              {importing ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  <p className="mt-2 text-sm text-blue-600">Importing...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FileSpreadsheet className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">CSV files only</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={importing}
              />
            </label>

            {/* Import Result */}
            {importResult && (
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-800">Import Complete</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-gray-800">{importResult.totalRecords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Imported:</span>
                    <span className="font-medium text-emerald-600">{importResult.successfulImports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duplicates:</span>
                    <span className="font-medium text-amber-600">{importResult.duplicatesSkipped}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Errors:</span>
                    <span className="font-medium text-red-600">{importResult.errors}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <Download className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Export Transactions</h3>
          </div>
          
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-600">
              Export your transactions to CSV for backup or analysis.
            </p>

            {/* Date Range */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700 text-sm">Date Range</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export to CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sample CSV */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex items-start gap-4">
        <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
          <Info className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Need a sample file?</h4>
          <p className="text-sm text-gray-600 mt-1 mb-3">Download a sample CSV to see the correct format.</p>
          <button
            onClick={downloadSampleCSV}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            Download Sample CSV →
          </button>
        </div>
      </div>
    </div>
  );
}
