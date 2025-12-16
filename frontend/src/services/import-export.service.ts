import { apiClient } from '../lib/api-client';

export interface ImportResult {
  totalRecords: number;
  successfulImports: number;
  duplicatesSkipped: number;
  errors: number;
  message: string;
}

export const importExportService = {
  async importCSV(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post<ImportResult>('import-export/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  async exportCSV(startDate: string, endDate: string): Promise<Blob> {
    const params = new URLSearchParams({ startDate, endDate });
    return apiClient.get<Blob>(`import-export/export/csv?${params.toString()}`, {
      responseType: 'blob'
    });
  },

  downloadCSV(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
