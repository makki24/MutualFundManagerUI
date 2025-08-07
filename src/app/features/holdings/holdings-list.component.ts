import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { PortfolioService } from '../../core/services/portfolio.service';
import { StockService } from '../../core/services/stock.service';
import { Portfolio, Holding } from '../../core/models/portfolio.model';
import { BuySharesDialogComponent, BuySharesDialogData } from './buy-shares-dialog/buy-shares-dialog.component';

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
    MatFormFieldModule,
    MatTooltipModule
  ],
  template: `
    <div class="holdings-container">
      <div class="page-header">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()" matTooltip="Back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Holdings Management</h1>
        </div>
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

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-left h1 {
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

      .header-left {
        justify-content: center;
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
  private stockService = inject(StockService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  portfolios: Portfolio[] = [];
  holdings: Holding[] = [];
  selectedPortfolioControl = new FormControl<number | null>(null);
  isLoading = false;
  displayedColumns = ['symbol', 'quantity', 'avgPrice', 'currentPrice', 'totalValue', 'gainLoss', 'actions'];

  ngOnInit(): void {
    // Check for portfolioId query parameter
    const portfolioIdParam = this.route.snapshot.queryParams['portfolioId'];
    this.loadPortfolios(portfolioIdParam ? Number(portfolioIdParam) : null);
  }

  loadPortfolios(preselectedPortfolioId?: number | null): void {
    this.portfolioService.getPortfolios().subscribe({
      next: (response) => {
        if (response.success) {
          this.portfolios = response.data || [];
          if (preselectedPortfolioId && this.portfolios.find(p => p.id === preselectedPortfolioId)) {
            this.selectedPortfolioControl.setValue(preselectedPortfolioId);
          } else if (this.portfolios.length > 0) {
            this.selectedPortfolioControl.setValue(this.portfolios[0].id);
          }
          this.onPortfolioChange();
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
        this.holdings = holdings.data ?? [];
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
    const portfolioId = this.selectedPortfolioControl.value;
    if (!portfolioId) return;

    const portfolio = this.portfolios.find(p => p.id === portfolioId);
    if (!portfolio) return;

    const dialogRef = this.dialog.open(BuySharesDialogComponent, {
      maxWidth: 900,
      data: {
        portfolioId: portfolioId,
        portfolioName: portfolio.name
      } as BuySharesDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadHoldings(portfolioId);
        this.snackBar.open('New holding added successfully!', 'Close', { duration: 3000 });
      }
    });
  }

  buyShares(holding: Holding): void {
    const portfolioId = this.selectedPortfolioControl.value;
    if (!portfolioId) return;

    const portfolio = this.portfolios.find(p => p.id === portfolioId);
    if (!portfolio) return;

    const dialogRef = this.dialog.open(BuySharesDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        portfolioId: portfolioId,
        portfolioName: portfolio.name,
        existingHolding: {
          symbol: holding.symbol,
          companyName: holding.companyName,
          currentPrice: holding.currentPrice
        }
      } as BuySharesDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadHoldings(portfolioId);
        this.snackBar.open('Shares purchased successfully!', 'Close', { duration: 3000 });
      }
    });
  }

  sellShares(holding: Holding): void {
    this.snackBar.open(`Sell shares for ${holding.symbol} feature coming soon!`, 'Close', { duration: 3000 });
  }

  updatePrice(holding: Holding): void {
    const portfolioId = this.selectedPortfolioControl.value;
    if (!portfolioId) return;

    this.stockService.getStockPrice(holding.symbol).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(`Price updated for ${holding.symbol}: ${response.data?.primaryPrice}`, 'Close', { duration: 3000 });
          this.loadHoldings(portfolioId);
        }
      },
      error: (error) => {
        console.error('Failed to update price:', error);
        this.snackBar.open(`Failed to update price for ${holding.symbol}`, 'Close', { duration: 3000 });
      }
    });
  }

  updateAllPrices(): void {
    const portfolioId = this.selectedPortfolioControl.value;
    if (!portfolioId) return;

    this.snackBar.open('Updating all prices...', 'Close', { duration: 2000 });

    // Update prices for all holdings
    const updatePromises = this.holdings.map(holding =>
      this.stockService.getStockPrice(holding.symbol).toPromise()
    );

    Promise.allSettled(updatePromises).then(() => {
      this.loadHoldings(portfolioId);
      this.snackBar.open('All prices updated successfully!', 'Close', { duration: 3000 });
    });
  }

  goBack(): void {
    const portfolioId = this.route.snapshot.queryParams['portfolioId'];
    if (portfolioId) {
      this.router.navigate(['/portfolios', portfolioId]);
    } else {
      this.router.navigate(['/portfolios']);
    }
  }
}
