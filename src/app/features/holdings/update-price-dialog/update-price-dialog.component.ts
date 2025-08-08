import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Holding } from '../../../core/models/portfolio.model';

export interface UpdatePriceDialogData {
  holding: Holding;
  portfolioId: number;
}

export interface UpdatePriceDialogResult {
  newPrice: number;
}

@Component({
  selector: 'app-update-price-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="update-price-dialog">
      <h2 mat-dialog-title>
        <mat-icon>edit</mat-icon>
        Update Stock Price
      </h2>

      <mat-dialog-content>
        <div class="stock-info">
          <div class="stock-symbol">{{ data.holding.symbol }}</div>
          <div class="stock-name">{{ data.holding.companyName }}</div>
          <div class="current-price">
            Current Price: {{ data.holding.currentPrice | currency:'USD':'symbol':'1.2-2' }}
          </div>
        </div>

        <form [formGroup]="priceForm" class="price-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New Price (USD)</mat-label>
            <input matInput 
                   type="number" 
                   formControlName="newPrice" 
                   min="0.01" 
                   step="0.01"
                   placeholder="Enter new price">
            <mat-hint>Enter the new price for {{ data.holding.symbol }}</mat-hint>
            @if (priceForm.get('newPrice')?.hasError('required')) {
              <mat-error>Price is required</mat-error>
            }
            @if (priceForm.get('newPrice')?.hasError('min')) {
              <mat-error>Price must be greater than 0</mat-error>
            }
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                (click)="onUpdate()" 
                [disabled]="priceForm.invalid || isUpdating">
          @if (isUpdating) {
            <mat-spinner diameter="16" style="margin-right: 8px;"></mat-spinner>
          }
          Update Price
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .update-price-dialog {
      min-width: 400px;
    }

    .stock-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .stock-symbol {
      font-size: 18px;
      font-weight: 600;
      color: #1976d2;
      margin-bottom: 4px;
    }

    .stock-name {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .current-price {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .price-form {
      display: flex;
      flex-direction: column;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-dialog-actions {
      gap: 8px;
    }
  `]
})
export class UpdatePriceDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UpdatePriceDialogComponent>);

  priceForm: FormGroup;
  isUpdating = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: UpdatePriceDialogData) {
    this.priceForm = this.fb.group({
      newPrice: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpdate(): void {
    if (this.priceForm.valid) {
      const result: UpdatePriceDialogResult = {
        newPrice: this.priceForm.value.newPrice
      };
      this.dialogRef.close(result);
    }
  }
}
