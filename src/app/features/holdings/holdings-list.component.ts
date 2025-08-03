import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { PortfolioService } from '../../core/services/portfolio.service';
import { Portfolio, Holding } from '../../core/models/portfolio.model';

@Component({
  selector: 'app-holdings-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="holdings-container">
      <div class="page-header">
        <h1>Holdings Management</h1>
        <div class="header-actions">
          <mat-form-field appearance="outline">
            <mat-label>Select Portfolio</mat-label>
            <mat-select [formControl]="selectedPortfolioControl" (selectionChange)="onPortfolioChange()">
              @for (portfolio of portfolios; track portfolio.id) {
                <mat-option [value]="portfolio.id">{{ portfolio.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="addHolding()" [disabled]="!selectedPortfolioControl.value">
            <mat-icon>add</mat-icon>
            Add Holding
          </button>
        </div>
      </div>

      @if (isLoading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading holdings...</p>
        </div>
      } @else if (selectedPortfolioControl.value && holdings.length > 0) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ getSelectedPortfolioName() }} Holdings</mat-card-title>
            <div class="card-actions">
              <button mat-button color="primary" (click)="updateAllPrices()">
                <mat-icon>refresh</mat-icon>
                Update Prices
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="holdings" class="holdings-table">
                <ng-container matColumnDef="symbol">
                  <th mat-header-cell *matHeaderCellDef>Symbol</th>
                  <td mat-cell *matCellDef="let holding">
                    <div class="holding-info">
                      <div class="holding-symbol">{{ holding.symbol }}</div>
                      <div class="holding-company">{{ holding.companyName }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantity</th>
                  <td mat-cell *matCellDef="let holding">
                    {{ holding.quantity | number:'1.0-0' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="avgPrice">
                  <th mat-header-cell *matHeaderCellDef>Avg Price</th>
                  <td mat-cell *matCellDef="let holding">
                    {{ holding.averagePrice | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="currentPrice">
                  <th mat-header-cell *matHeaderCellDef>Current Price</th>
                  <td mat-cell *matCellDef="let holding">
                    {{ holding.currentPrice | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="totalValue">
                  <th mat-header-cell *matHeaderCellDef>Total Value</th>
                  <td mat-cell *matCellDef="let holding">
                    {{ holding.totalValue | currency:'USD':'symbol':'1.2-2' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="gainLoss">
                  <th mat-header-cell *matHeaderCellDef>Gain/Loss</th>
                  <td mat-cell *matCellDef="let holding">
                    <div class="gain-loss-info">
                      <div class="gain-loss-amount" [class.positive]="holding.gainLoss >= 0"
                           [class.negative]="holding.gainLoss < 0">
                        {{ holding.gainLoss | currency:'USD':'symbol':'1.2-2' }}
                      </div>
                      <div class="gain-loss-percentage" [class.positive]="holding.gainLossPercentage >= 0"
                           [class.negative]="holding.gainLossPercentage < 0">
                        ({{ holding.gainLossPercentage | number:'1.2-2' }}%)
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let holding">
                    <button mat-icon-button color="primary" (click)="buyShares(holding)"
                            matTooltip="Buy Shares">
                      <mat-icon>add_shopping_cart</mat-icon>
                    </button>
                    <button mat-icon-button color="accent" (click)="sellShares(holding)"
                            matTooltip="Sell Shares">
                      <mat-icon>remove_shopping_cart</mat-icon>
                    </button>
                    <button mat-icon-button (click)="updatePrice(holding)"
                            matTooltip="Update Price">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      } @else if (selectedPortfolioControl.value && holdings.length === 0) {
        <div class="no-data">
          <mat-icon>trending_up</mat-icon>
          <h3>No Holdings Found</h3>
          <p>This portfolio doesn't have any holdings yet.</p>
          <button mat-raised-button color="primary" (click)="addHolding()">
            <mat-icon>add</mat-icon>
            Add First Holding
          </button>
        </div>
      } @else {
        <div class="no-selection">
          <mat-icon>pie_chart</mat-icon>
          <h3>Select a Portfolio</h3>
          <p>Please select a portfolio to view its holdings.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .holdings-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 20px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
      color: #333;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-actions mat-form-field {
      min-width: 200px;
    }

    .card-actions {
      margin-left: auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .holdings-table {
      width: 100%;
    }

    .holding-info {
      display: flex;
      flex-direction: column;
    }

    .holding-symbol {
      font-weight: 600;
      font-size: 14px;
      color: #1976d2;
    }

    .holding-company {
      font-size: 12px;
      color: #666;
    }

    .gain-loss-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .gain-loss-amount {
      font-weight: 500;
    }

    .gain-loss-percentage {
      font-size: 12px;
      opacity: 0.8;
    }

    .gain-loss-amount.positive, .gain-loss-percentage.positive {
      color: #4caf50;
    }

    .gain-loss-amount.negative, .gain-loss-percentage.negative {
      color: #f44336;
    }

    .no-data, .no-selection {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #666;
    }

    .no-data mat-icon, .no-selection mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-data h3, .no-selection h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
    }

    .no-data p, .no-selection p {
      margin: 0 0 24px 0;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .page-header h1 {
        text-align: center;
      }

      .header-actions {
        flex-direction: column;
      }

      .header-actions mat-form-field {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class HoldingsListComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  private snackBar = inject(MatSnackBar);

  portfolios: Portfolio[] = [];
  holdings: Holding[] = [];
  selectedPortfolioControl = new FormControl<number | null>(null);
  isLoading = false;
  displayedColumns = ['symbol', 'quantity', 'avgPrice', 'currentPrice', 'totalValue', 'gainLoss', 'actions'];

  ngOnInit(): void {
    this.loadPortfolios();
  }

  loadPortfolios(): void {
    this.portfolioService.getPortfolios().subscribe({
      next: (response) => {
        if (response.success) {
          this.portfolios = response.data || [];
          if (this.portfolios.length > 0) {
            this.selectedPortfolioControl.setValue(this.portfolios[0].id);
            this.onPortfolioChange();
          }
        }
      },
      error: (error) => {
        console.error('Failed to load portfolios:', error);
        this.snackBar.open('Failed to load portfolios', 'Close', { duration: 5000 });
      }
    });
  }

  onPortfolioChange(): void {
    const portfolioId = this.selectedPortfolioControl.value;
    if (portfolioId) {
      this.loadHoldings(portfolioId);
    } else {
      this.holdings = [];
    }
  }

  loadHoldings(portfolioId: number): void {
    this.isLoading = true;
    this.portfolioService.getPortfolioHoldings(portfolioId).subscribe({
      next: (holdings) => {
        this.holdings = holdings;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load holdings:', error);
        this.snackBar.open('Failed to load holdings', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  getSelectedPortfolioName(): string {
    const portfolioId = this.selectedPortfolioControl.value;
    const portfolio = this.portfolios.find(p => p.id === portfolioId);
    return portfolio?.name || '';
  }

  addHolding(): void {
    this.snackBar.open('Add holding feature coming soon!', 'Close', { duration: 3000 });
  }

  buyShares(holding: Holding): void {
    this.snackBar.open(`Buy shares for ${holding.symbol} feature coming soon!`, 'Close', { duration: 3000 });
  }

  sellShares(holding: Holding): void {
    this.snackBar.open(`Sell shares for ${holding.symbol} feature coming soon!`, 'Close', { duration: 3000 });
  }

  updatePrice(holding: Holding): void {
    this.snackBar.open(`Update price for ${holding.symbol} feature coming soon!`, 'Close', { duration: 3000 });
  }

  updateAllPrices(): void {
    const portfolioId = this.selectedPortfolioControl.value;
    if (!portfolioId) return;

    this.snackBar.open('Update all prices feature coming soon!', 'Close', { duration: 3000 });
  }
}
