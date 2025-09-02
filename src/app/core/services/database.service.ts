import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DatabaseStatus {
  database: string;
  tables: number;
  status: string;
}

export interface DatabaseRestoreInfo {
  supportedFormats: string[];
  maxFileSize: string;
  warning: string;
  requirements: string[];
  process: string[];
}

export interface DatabaseExportInfo {
  format: string;
  includes: string[];
  features: string[];
  usage: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/admin/database';

  /**
   * Get current database status information
   */
  getDatabaseStatus(): Observable<ApiResponse<DatabaseStatus>> {
    return this.http.get<ApiResponse<DatabaseStatus>>(`${this.API_URL}/status`);
  }

  /**
   * Get information about database restoration requirements and process
   */
  getRestoreInfo(): Observable<ApiResponse<DatabaseRestoreInfo>> {
    return this.http.get<ApiResponse<DatabaseRestoreInfo>>(`${this.API_URL}/restore-info`);
  }

  /**
   * Get information about database export functionality
   */
  getExportInfo(): Observable<ApiResponse<DatabaseExportInfo>> {
    return this.http.get<ApiResponse<DatabaseExportInfo>>(`${this.API_URL}/export-info`);
  }

  /**
   * Export current database to SQL dump file for download
   */
  exportDatabase(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/octet-stream'
      })
    });
  }

  /**
   * Restore database from SQL dump file
   * WARNING: This operation drops the current database and recreates it
   */
  restoreDatabase(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<string>>(`${this.API_URL}/restore`, formData);
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    const allowedExtensions = ['.sql', '.dump'];
    
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 100MB limit' };
    }

    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return { valid: false, error: 'File must have .sql or .dump extension' };
    }

    return { valid: true };
  }

  /**
   * Generate filename for database export
   */
  generateExportFilename(): string {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .replace('T', '_');
    return `database_export_mutual_fund_manager_${timestamp}.sql`;
  }
}
