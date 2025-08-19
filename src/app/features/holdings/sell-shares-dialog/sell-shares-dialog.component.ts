import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Holding } from '../../../core/models/portfolio.model';
import { HoldingService } from '../../../core/services/holding.service';

export interface SellSharesDialogData {
  portfolioId: number;
  holding: Holding;
  adminUserId: number;
}

@Component({
  selector: 'app-sell-shares-dialog',
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
    <div class="sell-shares-dialog">
      <h2 mat-dialog-title>
        <mat-icon>remove_shopping_cart</mat-icon>
        Sell Shares
      </h2>

      <mat-dialog-content>
        <form [formGroup]="sellForm" class="sell-form">
          <div class="existing-holding">
            <div class="stock-info">
              <div class="stock-header">
                <span class="stock-symbol">{{ data.holding.symbol }}</span>
                <span class="stock-name">{{ data.holding.companyName }}</span>
              </div>
              <div class="current-price">
                <span class="price-label">Current Price:</span>
                <span class="price-value">₹{{ data.holding.currentPrice | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Sell Details</h3>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Quantity</mat-label>
                <input matInput type="number" formControlName="quantity" min="0.0001" step="0.0001">
                <mat-hint>Max: {{ data.holding.quantity | number:'1.0-4' }}</mat-hint>
                @if (sellForm.get('quantity')?.hasError('required')) {
                  <mat-error>Quantity is required</mat-error>
                }
                @if (sellForm.get('quantity')?.hasError('min')) {
                  <mat-error>Quantity must be greater than 0</mat-error>
                }
                @if (sellForm.get('quantity')?.hasError('max')) {
                  <mat-error>Quantity cannot exceed held quantity</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Price per Share (₹)</mat-label>
                <input matInput type="number" formControlName="price" min="0.0001" step="0.01">
                @if (sellForm.get('price')?.hasError('required')) {
                  <mat-error>Price is required</mat-error>
                }
                @if (sellForm.get('price')?.hasError('min')) {
                  <mat-error>Price must be greater than 0</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Additional Charges (₹)</mat-label>
              <input matInput type="number" formControlName="additionalCharges" min="0" step="0.01">
              <mat-hint>Optional charges, brokerage handled by portfolio settings</mat-hint>
              @if (sellForm.get('additionalCharges')?.hasError('min')) {
                <mat-error>Additional charges cannot be negative</mat-error>
              }
            </mat-form-field>

            <div class="calculation-summary">
              <h3>Sale Summary</h3>
              <div class="summary-row">
                <span>Shares:</span>
                <span>{{ sellForm.get('quantity')?.value || 0 | number:'1.0-4' }}</span>
              </div>
              <div class="summary-row">
                <span>Price per Share:</span>
                <span>₹{{ sellForm.get('price')?.value || 0 | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹{{ getSubtotal() | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Additional Charges:</span>
                <span>₹{{ sellForm.get('additionalCharges')?.value || 0 | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row total">
                <span>Net Proceeds:</span>
                <span>₹{{ getNetProceeds() | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="accent" (click)="onSell()" [disabled]="!canSell() || isLoading">
          @if (isLoading) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>remove_shopping_cart</mat-icon>
          }
          Sell Shares
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .sell-shares-dialog { width: 600px; max-width: 90vw; }
    .sell-shares-dialog h2 { display:flex; align-items:center; gap:8px; margin:0; }
    .sell-form { display:flex; flex-direction:column; gap:24px; }
    .form-section { display:flex; flex-direction:column; gap:16px; }
    .form-row { display:flex; gap:16px; }
    .form-row mat-form-field { flex:1; }
    .existing-holding { padding:16px; border:1px solid #e0e0e0; border-radius:8px; background:#f9f9f9; }
    .stock-info { display:flex; justify-content:space-between; align-items:flex-start; }
    .stock-header { display:flex; flex-direction:column; gap:4px; }
    .stock-symbol { font-weight:600; font-size:16px; color:#1976d2; }
    .stock-name { font-size:14px; color:#333; }
    .current-price { display:flex; align-items:center; gap:8px; }
    .price-label { font-size:12px; color:#666; }
    .price-value { font-weight:600; font-size:16px; color:#333; }
    .calculation-summary { padding:16px; background:#f5f5f5; border-radius:8px; }
    .calculation-summary h3 { margin:0 0 12px 0; font-size:16px; font-weight:500; }
    .summary-row { display:flex; justify-content:space-between; align-items:center; padding:4px 0; }
    .summary-row.total { border-top:1px solid #ddd; margin-top:8px; padding-top:8px; font-weight:600; font-size:16px; }
    mat-dialog-actions { padding:16px 0 0 0; }
    mat-dialog-actions button { margin-left:8px; }
  `]
})
export class SellSharesDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private holdingService = inject(HoldingService);
  private snackBar = inject(MatSnackBar);

  sellForm: FormGroup;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<SellSharesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SellSharesDialogData
  ) {
    this.sellForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(0.0001), Validators.max(this.data.holding.quantity || 0)]],
      price: [this.data.holding.currentPrice || 0, [Validators.required, Validators.min(0.0001)]],
      additionalCharges: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {}

  getSubtotal(): number {
    const quantity = this.sellForm.get('quantity')?.value || 0;
    const price = this.sellForm.get('price')?.value || 0;
    return quantity * price;
  }

  getNetProceeds(): number {
    const subtotal = this.getSubtotal();
    const additionalCharges = this.sellForm.get('additionalCharges')?.value || 0;
    return subtotal - additionalCharges;
  }

  canSell(): boolean {
    return this.sellForm.valid;
  }

  onSell(): void {
    if (!this.canSell()) return;

    this.isLoading = true;
    const { quantity, price, additionalCharges } = this.sellForm.value;

    this.holdingService
      .sellShares(
        this.data.portfolioId,
        this.data.holding.symbol,
        quantity,
        price,
        this.data.adminUserId,
        additionalCharges || 0
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Shares sold successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(response.data);
          } else {
            this.snackBar.open(response.message || 'Failed to sell shares', 'Close', { duration: 5000 });
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to sell shares:', error);
          this.snackBar.open('Failed to sell shares', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
