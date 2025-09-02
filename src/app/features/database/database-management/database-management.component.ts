import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { DatabaseService, DatabaseStatus, DatabaseRestoreInfo, DatabaseExportInfo } from '../../../core/services/database.service';
import { DatabaseRestoreDialogComponent } from '../database-restore-dialog/database-restore-dialog.component';

@Component({
  selector: 'app-database-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    MatChipsModule,
    MatExpansionModule
  ],
  templateUrl: './database-management.component.html',
  styleUrls: ['./database-management.component.scss']
})
export class DatabaseManagementComponent implements OnInit {
  private readonly databaseService = inject(DatabaseService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  // Signals for reactive state management
  databaseStatus = signal<DatabaseStatus | null>(null);
  restoreInfo = signal<DatabaseRestoreInfo | null>(null);
  exportInfo = signal<DatabaseExportInfo | null>(null);
  isLoadingStatus = signal(false);
  isExporting = signal(false);
  isLoadingInfo = signal(false);

  ngOnInit(): void {
    this.loadDatabaseStatus();
    this.loadDatabaseInfo();
  }

  private loadDatabaseStatus(): void {
    this.isLoadingStatus.set(true);
    this.databaseService.getDatabaseStatus().subscribe({
      next: (response) => {
        if (response.success) {
          this.databaseStatus.set(response.data);
        } else {
          this.showError('Failed to load database status');
        }
        this.isLoadingStatus.set(false);
      },
      error: (error) => {
        console.error('Error loading database status:', error);
        this.showError('Failed to load database status');
        this.isLoadingStatus.set(false);
      }
    });
  }

  private loadDatabaseInfo(): void {
    this.isLoadingInfo.set(true);
    
    // Load restore info
    this.databaseService.getRestoreInfo().subscribe({
      next: (response) => {
        if (response.success) {
          this.restoreInfo.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading restore info:', error);
      }
    });

    // Load export info
    this.databaseService.getExportInfo().subscribe({
      next: (response) => {
        if (response.success) {
          this.exportInfo.set(response.data);
        }
        this.isLoadingInfo.set(false);
      },
      error: (error) => {
        console.error('Error loading export info:', error);
        this.isLoadingInfo.set(false);
      }
    });
  }

  exportDatabase(): void {
    this.isExporting.set(true);
    
    this.databaseService.exportDatabase().subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.databaseService.generateExportFilename();
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.showSuccess('Database exported successfully');
        this.isExporting.set(false);
      },
      error: (error) => {
        console.error('Error exporting database:', error);
        this.showError('Failed to export database');
        this.isExporting.set(false);
      }
    });
  }

  openRestoreDialog(): void {
    const dialogRef = this.dialog.open(DatabaseRestoreDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        restoreInfo: this.restoreInfo()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.showSuccess('Database restored successfully');
        this.loadDatabaseStatus(); // Refresh status after restore
      }
    });
  }

  refreshStatus(): void {
    this.loadDatabaseStatus();
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
