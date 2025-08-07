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

import { StockService } from '../../../core/services/stock.service';
import { Stock, StockPrice, BuySharesRequest } from '../../../core/models/stock.model';
import { StockSearchComponent } from '../../../shared/components/stock-search/stock-search.component';

export interface BuySharesDialogData {
  portfolioId: number;
  portfolioName: string;
  existingHolding?: {
    symbol: string;
    companyName: string;
    currentPrice: number;
  };
}

@Component({
  selector: 'app-buy-shares-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StockSearchComponent
  ],
  template: `
    <div class="buy-shares-dialog">
      <h2 mat-dialog-title>
        <mat-icon>add_shopping_cart</mat-icon>
        {{ data.existingHolding ? 'Buy More Shares' : 'Buy Shares' }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="buyForm" class="buy-form">
          @if (!data.existingHolding) {
            <div class="form-section">
              <h3>Select Stock</h3>
              <app-stock-search
                placeholder="Search for stocks..."
                (stockSelected)="onStockSelected($event)"
              ></app-stock-search>
              @if (selectedStock) {
                <div class="selected-stock">
                  <div class="stock-info">
                    <div class="stock-header">
                      <span class="stock-symbol">{{ selectedStock.primarySymbol }}</span>
                      <span class="stock-name">{{ selectedStock.displayName }}</span>
                    </div>
                    <div class="stock-details">
                      <span class="stock-industry">{{ selectedStock.industry }}</span>
                      <span class="stock-sector">{{ selectedStock.sector }}</span>
                    </div>
                  </div>
                  @if (currentPrice) {
                    <div class="price-info">
                      <div class="current-price">
                        <span class="price-label">Current Price:</span>
                        <span class="price-value">₹{{ currentPrice.primaryPrice | number:'1.2-2' }}</span>
                      </div>
                      @if (currentPrice.percentChange !== 0) {
                        <div class="price-change" [class.positive]="currentPrice.percentChange > 0" [class.negative]="currentPrice.percentChange < 0">
                          {{ currentPrice.percentChange > 0 ? '+' : '' }}{{ currentPrice.percentChange | number:'1.2-2' }}%
                        </div>
                      }
                    </div>
                  }
                  @if (loadingPrice) {
                    <div class="loading-price">
                      <mat-spinner diameter="20"></mat-spinner>
                      <span>Loading price...</span>
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="existing-holding">
              <div class="stock-info">
                <div class="stock-header">
                  <span class="stock-symbol">{{ data.existingHolding.symbol }}</span>
                  <span class="stock-name">{{ data.existingHolding.companyName }}</span>
                </div>
                <div class="current-price">
                  <span class="price-label">Current Price:</span>
                  <span class="price-value">₹{{ data.existingHolding.currentPrice | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          }

          @if (selectedStock || data.existingHolding) {
            <div class="form-section">
              <h3>Purchase Details</h3>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Quantity</mat-label>
                  <input matInput type="number" formControlName="quantity" min="0.0001" step="0.0001">
                  @if (buyForm.get('quantity')?.hasError('required')) {
                    <mat-error>Quantity is required</mat-error>
                  }
                  @if (buyForm.get('quantity')?.hasError('min')) {
                    <mat-error>Quantity must be greater than 0</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Price per Share (₹)</mat-label>
                  <input matInput type="number" formControlName="price" min="0.0001" step="0.01">
                  @if (buyForm.get('price')?.hasError('required')) {
                    <mat-error>Price is required</mat-error>
                  }
                  @if (buyForm.get('price')?.hasError('min')) {
                    <mat-error>Price must be greater than 0</mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Additional Charges (₹)</mat-label>
                <input matInput type="number" formControlName="additionalCharges" min="0" step="0.01">
                <mat-hint>Optional charges separate from brokerage</mat-hint>
                @if (buyForm.get('additionalCharges')?.hasError('min')) {
                  <mat-error>Additional charges cannot be negative</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="2" placeholder="Optional description for this purchase"></textarea>
              </mat-form-field>
            </div>

            <div class="calculation-summary">
              <h3>Purchase Summary</h3>
              <div class="summary-row">
                <span>Shares:</span>
                <span>{{ buyForm.get('quantity')?.value || 0 | number:'1.0-4' }}</span>
              </div>
              <div class="summary-row">
                <span>Price per Share:</span>
                <span>₹{{ buyForm.get('price')?.value || 0 | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹{{ getSubtotal() | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Additional Charges:</span>
                <span>₹{{ buyForm.get('additionalCharges')?.value || 0 | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row total">
                <span>Total Amount:</span>
                <span>₹{{ getTotalAmount() | number:'1.2-2' }}</span>
              </div>
              <div class="summary-note">
                <mat-icon>info</mat-icon>
                <span>Brokerage will be calculated automatically based on portfolio settings</span>
              </div>
            </div>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button
          mat-raised-button
          color="primary"
          (click)="onBuy()"
          [disabled]="!canBuy() || isLoading"
        >
          @if (isLoading) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            <mat-icon>add_shopping_cart</mat-icon>
          }
          {{ data.existingHolding ? 'Buy More' : 'Buy Shares' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .buy-shares-dialog {
      width: 600px;
      max-width: 90vw;
    }

    .buy-shares-dialog h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .buy-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-section h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .selected-stock, .existing-holding {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #f9f9f9;
    }

    .stock-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .stock-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stock-symbol {
      font-weight: 600;
      font-size: 16px;
      color: #1976d2;
    }

    .stock-name {
      font-size: 14px;
      color: #333;
    }

    .stock-details {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .stock-industry, .stock-sector {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
    }

    .stock-industry {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .stock-sector {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .price-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .current-price {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .price-label {
      font-size: 12px;
      color: #666;
    }

    .price-value {
      font-weight: 600;
      font-size: 16px;
      color: #333;
    }

    .price-change {
      font-size: 12px;
      font-weight: 500;
    }

    .price-change.positive {
      color: #4caf50;
    }

    .price-change.negative {
      color: #f44336;
    }

    .loading-price {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 12px;
    }

    .calculation-summary {
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .calculation-summary h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }

    .summary-row.total {
      border-top: 1px solid #ddd;
      margin-top: 8px;
      padding-top: 8px;
      font-weight: 600;
      font-size: 16px;
    }

    .summary-note {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px;
      background-color: #e3f2fd;
      border-radius: 4px;
      font-size: 12px;
      color: #1976d2;
    }

    .summary-note mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }

    mat-dialog-actions button {
      margin-left: 8px;
    }
  `]
})
export class BuySharesDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private stockService = inject(StockService);
  private snackBar = inject(MatSnackBar);

  buyForm: FormGroup;
  selectedStock: Stock | null = null;
  currentPrice: StockPrice | null = null;
  loadingPrice = false;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<BuySharesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BuySharesDialogData
  ) {
    this.buyForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(0.0001)]],
      price: [0, [Validators.required, Validators.min(0.0001)]],
      additionalCharges: [0, [Validators.min(0)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    if (this.data.existingHolding) {
      this.buyForm.patchValue({
        price: this.data.existingHolding.currentPrice
      });
    }
  }

  onStockSelected(stock: Stock): void {
    this.selectedStock = stock;
    this.loadStockPrice(stock.primarySymbol);
  }

  loadStockPrice(symbol: string): void {
    this.loadingPrice = true;
    this.stockService.getStockPrice(symbol).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentPrice = response.data;
          if (this.selectedStock)
            this.selectedStock.companyName = response.data.companyName
          this.buyForm.patchValue({
            price: response.data.primaryPrice
          });
        }
        this.loadingPrice = false;
      },
      error: (error) => {
        console.error('Failed to load stock price:', error);
        this.loadingPrice = false;
      }
    });
  }

  getSubtotal(): number {
    const quantity = this.buyForm.get('quantity')?.value || 0;
    const price = this.buyForm.get('price')?.value || 0;
    return quantity * price;
  }

  getTotalAmount(): number {
    const subtotal = this.getSubtotal();
    const additionalCharges = this.buyForm.get('additionalCharges')?.value || 0;
    return subtotal + additionalCharges;
  }

  canBuy(): boolean {
    return this.buyForm.valid && !!(this.selectedStock || this.data.existingHolding);
  }

  onBuy(): void {
    if (!this.canBuy()) return;

    this.isLoading = true;
    const formValue = this.buyForm.value;

    if (this.data.existingHolding) {
      // Buy more shares of existing holding
      this.stockService.buyMoreShares(
        this.data.portfolioId,
        this.data.existingHolding.symbol,
        formValue.quantity,
        formValue.price,
        formValue.additionalCharges || 0,
        1 // TODO: Get actual admin user ID
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Shares purchased successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(response.data);
          } else {
            this.snackBar.open(response.message || 'Failed to purchase shares', 'Close', { duration: 5000 });
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to buy shares:', error);
          this.snackBar.open('Failed to purchase shares', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
    } else if (this.selectedStock) {
      // Buy new shares
      const request: BuySharesRequest = {
        symbol: this.selectedStock.primarySymbol,
        companyName: this.selectedStock.companyName,
        quantity: formValue.quantity,
        price: formValue.price,
        additionalCharges: formValue.additionalCharges || 0,
        description: formValue.description || undefined
      };

      this.stockService.buyShares(this.data.portfolioId, request, 1).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Shares purchased successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close(response.data);
          } else {
            this.snackBar.open(response.message || 'Failed to purchase shares', 'Close', { duration: 5000 });
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to buy shares:', error);
          this.snackBar.open('Failed to purchase shares', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
