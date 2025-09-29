import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PortfolioService } from '../../../core/services/portfolio.service';
import { Holding } from '../../../core/models/portfolio.model';

export interface EditHoldingDialogData {
  holding: Holding;
  portfolioId: number;
}

export interface EditHoldingDialogResult {
  symbol: string;
  companyName: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

@Component({
  selector: 'app-edit-holding-dialog',
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
    <div class="edit-holding-dialog">
      <h2 mat-dialog-title>
        <mat-icon>edit</mat-icon>
        Edit Holding
      </h2>

      <mat-dialog-content>
        <form [formGroup]="editForm" class="edit-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Stock Symbol</mat-label>
              <input matInput 
                     formControlName="symbol"
                     placeholder="e.g., AAPL"
                     autocomplete="off">
              <mat-icon matSuffix>trending_up</mat-icon>
              @if (editForm.get('symbol')?.hasError('required')) {
                <mat-error>Stock symbol is required</mat-error>
              }
              @if (editForm.get('symbol')?.hasError('pattern')) {
                <mat-error>Please enter a valid stock symbol</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Company Name</mat-label>
              <input matInput 
                     formControlName="companyName"
                     placeholder="e.g., Apple Inc."
                     autocomplete="off">
              <mat-icon matSuffix>business</mat-icon>
              @if (editForm.get('companyName')?.hasError('required')) {
                <mat-error>Company name is required</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Quantity</mat-label>
              <input matInput 
                     type="number"
                     formControlName="quantity"
                     placeholder="0"
                     step="0.01"
                     min="0.01">
              <mat-icon matSuffix>inventory</mat-icon>
              @if (editForm.get('quantity')?.hasError('required')) {
                <mat-error>Quantity is required</mat-error>
              }
              @if (editForm.get('quantity')?.hasError('min')) {
                <mat-error>Quantity must be greater than 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Buy Price (₹)</mat-label>
              <input matInput 
                     type="number"
                     formControlName="buyPrice"
                     placeholder="0.00"
                     step="0.01"
                     min="0.01">
              <mat-icon matSuffix>attach_money</mat-icon>
              @if (editForm.get('buyPrice')?.hasError('required')) {
                <mat-error>Buy price is required</mat-error>
              }
              @if (editForm.get('buyPrice')?.hasError('min')) {
                <mat-error>Buy price must be greater than 0</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Current Price (₹)</mat-label>
              <input matInput 
                     type="number"
                     formControlName="currentPrice"
                     placeholder="0.00"
                     step="0.01"
                     min="0.01">
              <mat-icon matSuffix>trending_up</mat-icon>
              @if (editForm.get('currentPrice')?.hasError('required')) {
                <mat-error>Current price is required</mat-error>
              }
              @if (editForm.get('currentPrice')?.hasError('min')) {
                <mat-error>Current price must be greater than 0</mat-error>
              }
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isLoading">
          Cancel
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSave()"
                [disabled]="editForm.invalid || isLoading">
          @if (isLoading) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>save</mat-icon>
          }
          Save Changes
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .edit-holding-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: calc(50% - 8px);
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: #1976d2;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
    }

    mat-dialog-actions button {
      margin-left: 8px;
    }

    mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 600px) {
      .edit-holding-dialog {
        min-width: 90vw;
        max-width: 95vw;
      }

      .form-row {
        flex-direction: column;
        gap: 8px;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class EditHoldingDialogComponent implements OnInit {
  editForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EditHoldingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditHoldingDialogData
  ) {
    this.editForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      symbol: ['', [Validators.required, Validators.pattern(/^[A-Z0-9._-]+$/)]],
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      buyPrice: [0, [Validators.required, Validators.min(0.01)]],
      currentPrice: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  private populateForm(): void {
    const holding = this.data.holding;
    this.editForm.patchValue({
      symbol: holding.symbol,
      companyName: holding.companyName,
      quantity: holding.quantity,
      buyPrice: holding.buyPrice,
      currentPrice: holding.currentPrice
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.editForm.value;
    
    const updateData = {
      symbol: formValue.symbol.toUpperCase().trim(),
      companyName: formValue.companyName.trim(),
      quantity: Number(formValue.quantity),
      buyPrice: Number(formValue.buyPrice),
      currentPrice: Number(formValue.currentPrice)
    };

    this.portfolioService.updateHolding(this.data.portfolioId, this.data.holding.id!, updateData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.snackBar.open('Holding updated successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(updateData);
        } else {
          this.snackBar.open(response.message || 'Failed to update holding', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to update holding:', error);
        const errorMessage = error.error?.message || 'Failed to update holding';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }
}
