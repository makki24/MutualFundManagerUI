import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-content">
      @if (data.icon) {
        <div class="dialog-icon">
          <mat-icon [class]="'icon-' + (data.confirmColor || 'primary')">{{ data.icon }}</mat-icon>
        </div>
      }

      <h2 mat-dialog-title>{{ data.title }}</h2>

      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button [color]="data.confirmColor || 'primary'" (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-content {
      text-align: center;
      padding: 24px;
      min-width: 300px;
    }

    .dialog-icon {
      margin-bottom: 16px;
    }

    .dialog-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .icon-primary {
      color: #1976d2;
    }

    .icon-accent {
      color: #ff4081;
    }

    .icon-warn {
      color: #f44336;
    }

    h2 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
    }

    mat-dialog-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    .dialog-actions {
      margin-top: 24px;
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .dialog-actions button {
      min-width: 100px;
    }

    @media (max-width: 480px) {
      .dialog-content {
        padding: 20px;
        min-width: 250px;
      }

      .dialog-actions {
        flex-direction: column;
      }

      .dialog-actions button {
        width: 100%;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
