import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { DatabaseService, DatabaseRestoreInfo } from '../../../core/services/database.service';

export interface DatabaseRestoreDialogData {
  restoreInfo: DatabaseRestoreInfo | null;
}

@Component({
  selector: 'app-database-restore-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './database-restore-dialog.component.html',
  styleUrls: ['./database-restore-dialog.component.scss']
})
export class DatabaseRestoreDialogComponent {
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  validationError = signal<string | null>(null);
  dragOver = signal(false);

  constructor(
    private dialogRef: MatDialogRef<DatabaseRestoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DatabaseRestoreDialogData,
    private databaseService: DatabaseService,
    private snackBar: MatSnackBar
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    const validation = this.databaseService.validateFile(file);
    
    if (validation.valid) {
      this.selectedFile.set(file);
      this.validationError.set(null);
    } else {
      this.selectedFile.set(null);
      this.validationError.set(validation.error || 'Invalid file');
    }
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.validationError.set(null);
  }

  restoreDatabase(): void {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.isUploading.set(true);
    
    this.databaseService.restoreDatabase(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Database restored successfully', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close({ success: true, message: response.message });
        } else {
          this.showError(response.message || 'Failed to restore database');
        }
        this.isUploading.set(false);
      },
      error: (error) => {
        console.error('Error restoring database:', error);
        this.showError('Failed to restore database. Please check the file and try again.');
        this.isUploading.set(false);
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
