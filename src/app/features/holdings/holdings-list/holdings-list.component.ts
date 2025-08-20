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

import { PortfolioService } from '../../../core/services/portfolio.service';
import { HoldingService } from '../../../core/services/holding.service';
import { AuthService } from '../../../core/services/auth.service';
import { StockService } from '../../../core/services/stock.service';
import { Portfolio, Holding } from '../../../core/models/portfolio.model';
import { BuySharesDialogComponent, BuySharesDialogData } from '../buy-shares-dialog/buy-shares-dialog.component';
import { SellSharesDialogComponent, SellSharesDialogData } from '../sell-shares-dialog/sell-shares-dialog.component';
import { UpdatePriceDialogComponent, UpdatePriceDialogData, UpdatePriceDialogResult } from '../update-price-dialog/update-price-dialog.component';

interface PriceUpdateResult {
  success: boolean;
  message: string;
  data: {
    totalStocks: number;
    successfulUpdates: number;
    failedUpdates: number;
    stockUpdates: Array<{
      symbol: string;
      companyName: string;
      success: boolean;
      newPrice?: number;
      oldPrice?: number;
      message: string;
      errorReason?: string;
    }>;
    updateTimestamp: string;
  };
}

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
  templateUrl: './holdings-list.component.html',
  styleUrls: ['./holdings-list.component.css']
})
export class HoldingsListComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  private stockService = inject(StockService);
  private holdingService = inject(HoldingService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  portfolios: Portfolio[] = [];
  holdings: Holding[] = [];
  selectedPortfolioControl = new FormControl<number | null>(null);
  isLoading = false;
  isUpdatingPrices = false;
  displayedColumns = [
    'symbol',
    'quantity',
    'avgPrice',
    'currentPrice',
    'invested',
    'totalValue',
    'gainLoss',
    'lastUpdated',
    'actions'
  ];

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
      maxWidth: 900,
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
    const portfolioId = this.selectedPortfolioControl.value;
    if (!portfolioId) return;

    const adminUserId = this.authService.getCurrentUserId();
    if (!adminUserId) {
      this.snackBar.open('Cannot determine current admin user. Please re-login.', 'Close', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open<SellSharesDialogComponent, SellSharesDialogData, Holding>(SellSharesDialogComponent, {
      maxWidth: 900,
      data: {
        portfolioId,
        holding,
        adminUserId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadHoldings(portfolioId);
        this.snackBar.open('Shares sold successfully!', 'Close', { duration: 3000 });
      }
    });
  }

  updatePrice(holding: Holding): void {
    const portfolioId = this.selectedPortfolioControl.value;
    if (!portfolioId) return;

    const dialogRef = this.dialog.open(UpdatePriceDialogComponent, {
      width: '450px',
      data: {
        holding: holding,
        portfolioId: portfolioId
      } as UpdatePriceDialogData
    });

    dialogRef.afterClosed().subscribe((result: UpdatePriceDialogResult) => {
      if (result) {
        this.portfolioService.updateStockPrice(portfolioId, holding.symbol, result.newPrice).subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open(
                `Price updated for ${holding.symbol}: $${result.newPrice}`,
                'Close',
                { duration: 3000 }
              );
              this.loadHoldings(portfolioId);
            } else {
              this.snackBar.open(
                response.message || `Failed to update price for ${holding.symbol}`,
                'Close',
                { duration: 3000 }
              );
            }
          },
          error: (error) => {
            console.error('Failed to update price:', error);
            const errorMessage = error.error?.message || `Failed to update price for ${holding.symbol}`;
            this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  updateAllPrices(): void {
    const portfolioId = this.selectedPortfolioControl.value;
    if (!portfolioId) return;

    this.isUpdatingPrices = true;
    this.snackBar.open('Updating all prices...', 'Close', { duration: 2000 });

    this.portfolioService.updateAllPrices(portfolioId).subscribe({
      next: (response: PriceUpdateResult) => {
        this.isUpdatingPrices = false;

        if (response.success) {
          const { data } = response;

          // Update holdings with manual update flags
          this.updateHoldingsWithPriceResults(data.stockUpdates);

          // Show detailed success message
          const successMessage = `Price update completed: ${data.successfulUpdates}/${data.totalStocks} stocks updated successfully`;
          this.snackBar.open(successMessage, 'Close', { duration: 5000 });

          // Show warning for failed updates if any
          if (data.failedUpdates > 0) {
            const failedStocks = data.stockUpdates
              .filter(update => !update.success)
              .map(update => update.symbol)
              .join(', ');

            setTimeout(() => {
              this.snackBar.open(
                `${data.failedUpdates} stocks require manual update: ${failedStocks}`,
                'Close',
                { duration: 8000 }
              );
            }, 2000);
          }

          // Reload holdings to get updated data
          this.loadHoldings(portfolioId);
        } else {
          this.snackBar.open(response.message || 'Failed to update prices', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        this.isUpdatingPrices = false;
        console.error('Failed to update all prices:', error);

        let errorMessage = 'Failed to update prices';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  private updateHoldingsWithPriceResults(stockUpdates: any[]): void {
    // Update holdings with manual update flags based on API response
    this.holdings = this.holdings.map(holding => {
      const updateResult = stockUpdates.find(update => update.symbol === holding.symbol);
      if (updateResult) {
        return {
          ...holding,
          needsManualUpdate: !updateResult.success && updateResult.errorReason === 'PRICE_NOT_AVAILABLE'
        };
      }
      return holding;
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
