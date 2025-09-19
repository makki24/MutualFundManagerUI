import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PortfolioService } from '../../../core/services/portfolio.service';
import { HoldingService } from '../../../core/services/holding.service';
import { AuthService } from '../../../core/services/auth.service';
import { StockService } from '../../../core/services/stock.service';
import { Portfolio, Holding } from '../../../core/models/portfolio.model';
import { BuySharesDialogComponent, BuySharesDialogData } from '../buy-shares-dialog/buy-shares-dialog.component';
import { SellSharesDialogComponent, SellSharesDialogData } from '../sell-shares-dialog/sell-shares-dialog.component';
import { UpdatePriceDialogComponent, UpdatePriceDialogData, UpdatePriceDialogResult } from '../update-price-dialog/update-price-dialog.component';
import { ToolbarService } from '../../../layout/toolbar/toolbar.service';
import { HoldingsToolbarControlsComponent } from '../holdings-toolbar-controls/holdings-toolbar-controls.component';

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
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './holdings-list.component.html',
  styleUrls: ['./holdings-list.component.css']
})
export class HoldingsListComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private stockService = inject(StockService);
  private holdingService = inject(HoldingService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private toolbar = inject(ToolbarService);

  portfolios: Portfolio[] = [];
  holdings: Holding[] = [];
  filteredHoldings: Holding[] = [];
  selectedPortfolioControl = new FormControl<number | null>(null);
  searchControl = new FormControl('');
  isLoading = false;
  isUpdatingPrices = false;
  private pendingPortfolioId: number | null = null;
  
  // Error message properties for template display
  updatePricesErrorMessage: string | null = null;
  updatePricesSuccessMessage: string | null = null;
  updatePricesFailedStocks: string | null = null;
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
    // Register toolbar controls for this feature
    this.toolbar.setControls(HoldingsToolbarControlsComponent);

    // Setup search functionality
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterHoldings(searchTerm || '');
    });

    // Load portfolios and preselect from URL if provided
    const portfolioIdParam = this.route.snapshot.queryParams['portfolioId'];
    this.loadPortfolios(portfolioIdParam ? Number(portfolioIdParam) : null);

    // React to query param changes from toolbar
    this.route.queryParams.subscribe(params => {
      const pid = params['portfolioId'] ? Number(params['portfolioId']) : null;
      const addHolding = params['addHolding'] === 'true' || params['addHolding'] === true;
      const updatePrices = params['updatePrices'] === 'true' || params['updatePrices'] === true;
      const updatePricesByDate: string | null = typeof params['updatePricesByDate'] === 'string' ? params['updatePricesByDate'] : null;

      if (pid !== (this.selectedPortfolioControl.value ?? null)) {
        // If portfolios not yet loaded, store pending id
        if (this.portfolios.length === 0) {
          this.pendingPortfolioId = pid;
        } else if (!pid || this.portfolios.find(p => p.id === pid)) {
          this.selectedPortfolioControl.setValue(pid);
          this.onPortfolioChange();
        }
      }

      if (addHolding) {
        // Open dialog then remove the flag to avoid repeated openings
        setTimeout(() => {
          this.addHolding();
          this.router.navigate([], { queryParams: { addHolding: null }, queryParamsHandling: 'merge', replaceUrl: true });
        });
      }

      if (updatePrices) {
        setTimeout(() => {
          this.updateAllPrices();
          this.router.navigate([], { queryParams: { updatePrices: null }, queryParamsHandling: 'merge', replaceUrl: true });
        });
      }

      if (updatePricesByDate) {
        setTimeout(() => {
          this.updatePricesByDate(updatePricesByDate);
          this.router.navigate([], { queryParams: { updatePricesByDate: null }, queryParamsHandling: 'merge', replaceUrl: true });
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.toolbar.setControls(null);
  }

  loadPortfolios(preselectedPortfolioId?: number | null): void {
    this.portfolioService.getPortfolios().subscribe({
      next: (response) => {
        if (response.success) {
          this.portfolios = response.data || [];
          const effectivePreselect = this.pendingPortfolioId ?? preselectedPortfolioId;
          if (effectivePreselect && this.portfolios.find(p => p.id === effectivePreselect)) {
            this.selectedPortfolioControl.setValue(effectivePreselect);
          } else if (this.portfolios.length > 0) {
            this.selectedPortfolioControl.setValue(this.portfolios[0].id);
          }
          this.onPortfolioChange();
          this.pendingPortfolioId = null;
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
      this.filteredHoldings = [];
    }
  }

  loadHoldings(portfolioId: number): void {
    this.isLoading = true;
    this.portfolioService.getPortfolioHoldings(portfolioId).subscribe({
      next: (holdings) => {
        this.holdings = holdings.data ?? [];
        this.filterHoldings(this.searchControl.value || '');
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
        this.portfolioService.updateStockPrice(portfolioId, holding.symbol, result.newPrice, result.transactionDate).subscribe({
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

          this.updateHoldingsWithPriceResults(data.stockUpdates);

          const successMessage = `Price update completed: ${data.successfulUpdates}/${data.totalStocks} stocks updated successfully`;
          this.snackBar.open(successMessage, 'Close', { duration: 5000 });

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

  updatePricesByDate(date: string): void {
    const portfolioId = this.selectedPortfolioControl.value;
    if (!portfolioId) return;

    // Clear previous messages
    this.clearUpdateMessages();
    this.isUpdatingPrices = true;

    this.portfolioService.updatePricesByDate(portfolioId, date).subscribe({
      next: (response: any) => {
        this.isUpdatingPrices = false;

        if (response.success) {
          const { data } = response;

          if (data?.stockUpdates) {
            this.updateHoldingsWithPriceResults(data.stockUpdates);
          }

          const total = data?.totalStocks ?? 0;
          const successful = data?.successfulUpdates ?? 0;
          const failed = data?.failedUpdates ?? 0;
          
          // Set success message for template display
          this.updatePricesSuccessMessage = `Price update for ${date}: ${successful}/${total} stocks updated successfully`;

          if (failed > 0 && Array.isArray(data?.stockUpdates)) {
            const failedStocks = data.stockUpdates
              .filter((u: any) => !u.success)
              .map((u: any) => u.symbol)
              .join(', ');
            
            // Set failed stocks message for template display
            this.updatePricesFailedStocks = `${failed} stocks require manual update: ${failedStocks}`;
          }

          this.loadHoldings(portfolioId);
        } else {
          // Set error message for template display
          this.updatePricesErrorMessage = response.message || `Failed to update prices for ${date}`;
        }
      },
      error: (error) => {
        this.isUpdatingPrices = false;
        console.error('Failed to update prices by date:', error);
        let errorMessage = `Failed to update prices for ${date}`;
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Set error message for template display
        this.updatePricesErrorMessage = errorMessage;
      }
    });
  }

  /**
   * Clear all update-related messages
   */
  clearUpdateMessages(): void {
    this.updatePricesErrorMessage = null;
    this.updatePricesSuccessMessage = null;
    this.updatePricesFailedStocks = null;
  }

  /**
   * Clear specific error message
   */
  clearErrorMessage(): void {
    this.updatePricesErrorMessage = null;
  }

  /**
   * Clear specific success message
   */
  clearSuccessMessage(): void {
    this.updatePricesSuccessMessage = null;
  }

  /**
   * Clear failed stocks message
   */
  clearFailedStocksMessage(): void {
    this.updatePricesFailedStocks = null;
  }

  private updateHoldingsWithPriceResults(stockUpdates: any[]): void {
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
    // Re-apply current search filter after updating holdings
    this.filterHoldings(this.searchControl.value || '');
  }

  private filterHoldings(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredHoldings = [...this.holdings];
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    this.filteredHoldings = this.holdings.filter(holding => {
      return (
        holding.symbol.toLowerCase().includes(term) ||
        holding.companyName.toLowerCase().includes(term)
      );
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
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
