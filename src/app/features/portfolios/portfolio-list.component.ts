import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PortfolioService } from '../../core/services/portfolio.service';
import { AuthService } from '../../core/services/auth.service';
import { Portfolio } from '../../core/models/portfolio.model';
import { PortfolioFormDialogComponent } from './portfolio-form-dialog.component';
import { ClonePortfolioDialogComponent } from './clone-portfolio-dialog.component';

@Component({
  selector: 'app-portfolio-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="app-container">
      <!-- Mobile Header with Search -->
      @if (isMobile) {
        <div class="mobile-header">
          <h1>Portfolios</h1>
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search portfolios</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Search by name or creator">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
      }

      @if (isLoading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading portfolios...</p>
        </div>
      } @else if (filteredPortfolios.length > 0) {
        <!-- Portfolio Cards for Mobile -->
        @if (isMobile) {
          <div class="portfolio-cards-mobile">
            @for (portfolio of filteredPortfolios; track portfolio.id) {
              <mat-card class="portfolio-card-mobile" [class.expanded]="expandedCard === portfolio.id">
                <mat-card-header (click)="toggleCard(portfolio.id)">
                  <div class="card-header-content">
                    <div class="portfolio-title">
                      <h3>{{ portfolio.name }}</h3>
                      <span class="creator">by {{ portfolio.createdBy.username }}</span>
                    </div>
                    <div class="header-actions">
                      <mat-chip-set>
                        <mat-chip class="nav-chip">₹{{ portfolio.navValue | number:'1.2-2' }}</mat-chip>
                      </mat-chip-set>
                      <button mat-icon-button [matMenuTriggerFor]="mobileMenu" (click)="$event.stopPropagation()">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #mobileMenu="matMenu">
                        <button mat-menu-item (click)="viewPortfolio(portfolio.id)">
                          <mat-icon>visibility</mat-icon>
                          <span>View Details</span>
                        </button>
                        @if (isAdmin) {
                          <button mat-menu-item (click)="manageFees(portfolio.id)">
                            <mat-icon>account_balance</mat-icon>
                            <span>Manage Fees</span>
                          </button>
                          <button mat-menu-item (click)="clonePortfolio(portfolio)">
                            <mat-icon>content_copy</mat-icon>
                            <span>Clone Portfolio</span>
                          </button>
                          <mat-divider></mat-divider>
                          <button mat-menu-item (click)="deletePortfolio(portfolio.id)" class="delete-action">
                            <mat-icon>delete</mat-icon>
                            <span>Delete</span>
                          </button>
                        }
                      </mat-menu>
                    </div>
                  </div>
                  <mat-icon class="expand-icon" [class.rotated]="expandedCard === portfolio.id">expand_more</mat-icon>
                </mat-card-header>

                <mat-card-content class="expandable-content" [class.expanded]="expandedCard === portfolio.id">
                  <div class="portfolio-stats-mobile">
                    <div class="stat-row">
                      <div class="stat-item">
                        <mat-icon class="stat-icon">account_balance_wallet</mat-icon>
                        <div class="stat-info">
                          <span class="stat-label">Total AUM</span>
                          <span class="stat-value">{{ portfolio.totalAum | currency:'INR':'symbol':'1.0-0' }}</span>
                        </div>
                      </div>
                      <div class="stat-item">
                        <mat-icon class="stat-icon">people</mat-icon>
                        <div class="stat-info">
                          <span class="stat-label">Investors</span>
                          <span class="stat-value">{{ portfolio.totalInvestors }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="stat-row">
                      <div class="stat-item">
                        <mat-icon class="stat-icon">pie_chart</mat-icon>
                        <div class="stat-info">
                          <span class="stat-label">Holdings</span>
                          <span class="stat-value">{{ portfolio.totalHoldings }}</span>
                        </div>
                      </div>
                      <div class="stat-item">
                        <mat-icon class="stat-icon">savings</mat-icon>
                        <div class="stat-info">
                          <span class="stat-label">Available Cash</span>
                          <span class="stat-value">{{ portfolio.remainingCash | currency:'INR':'symbol':'1.0-0' }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="stat-row">
                      <div class="stat-item full-width">
                        <mat-icon class="stat-icon">trending_up</mat-icon>
                        <div class="stat-info">
                          <span class="stat-label">Total Units</span>
                          <span class="stat-value">{{ portfolio.totalUnits | number:'1.0-0' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mobile-actions">
                    <button mat-raised-button color="primary" (click)="viewPortfolio(portfolio.id)" class="primary-action">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        } @else {

          <!-- Portfolio Table for Desktop -->
          <mat-card>
            <mat-card-content>
              <div class="table-container">
                <table mat-table [dataSource]="filteredPortfolios" class="portfolios-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Portfolio Name</th>
                  <td mat-cell *matCellDef="let portfolio">
                    <div class="portfolio-info">
                      <div class="portfolio-name">{{ portfolio.name }}</div>
                      <div class="portfolio-creator">by {{ portfolio.createdBy.username }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="nav">
                  <th mat-header-cell *matHeaderCellDef>NAV</th>
                  <td mat-cell *matCellDef="let portfolio">
                    {{ portfolio.navValue | currency:'INR':'symbol':'1.4-4' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="aum">
                  <th mat-header-cell *matHeaderCellDef>Total AUM</th>
                  <td mat-cell *matCellDef="let portfolio">
                    {{ portfolio.totalAum | currency:'INR':'symbol':'1.0-0' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="units">
                  <th mat-header-cell *matHeaderCellDef>Total Units</th>
                  <td mat-cell *matCellDef="let portfolio">
                    {{ portfolio.totalUnits | number:'1.0-0' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="cash">
                  <th mat-header-cell *matHeaderCellDef>Available Cash</th>
                  <td mat-cell *matCellDef="let portfolio">
                    {{ portfolio.remainingCash | currency:'INR':'symbol':'1.0-0' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="investors">
                  <th mat-header-cell *matHeaderCellDef>Investors</th>
                  <td mat-cell *matCellDef="let portfolio">
                    {{ portfolio.totalInvestors }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="holdings">
                  <th mat-header-cell *matHeaderCellDef>Holdings</th>
                  <td mat-cell *matCellDef="let portfolio">
                    {{ portfolio.totalHoldings }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let portfolio">
                    @if (isAdmin) {
                      <button mat-icon-button color="primary" (click)="clonePortfolio(portfolio); $event.stopPropagation()"
                              matTooltip="Clone Portfolio">
                        <mat-icon>content_copy</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="deletePortfolio(portfolio.id); $event.stopPropagation()"
                              matTooltip="Delete Portfolio">
                        <mat-icon>delete</mat-icon>
                      </button>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                    class="portfolio-row" (click)="viewPortfolio(row.id)"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
        }
      } @else {
        <div class="empty-state">
          <mat-icon>pie_chart</mat-icon>
          <h3>{{ searchControl.value ? 'No Matching Portfolios' : 'No Portfolios Found' }}</h3>
          <p>{{ searchControl.value ? 'Try adjusting your search criteria.' : 'There are no portfolios available at the moment.' }}</p>
          @if (isAdmin && !searchControl.value) {
            <button mat-raised-button color="primary" (click)="createPortfolio()">
              <mat-icon>add</mat-icon>
              Create First Portfolio
            </button>
          }
        </div>
      }

      <!-- Floating Action Button for Mobile -->
      @if (isMobile && isAdmin) {
        <button mat-fab color="primary" class="fab-create" (click)="createPortfolio()" matTooltip="Create Portfolio">
          <mat-icon>add</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      min-height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      padding: 16px;
    }

    /* Mobile Header */
    .mobile-header {
      margin-bottom: 24px;
    }

    .mobile-header h1 {
      margin: 0 0 16px 0;
      font-size: 28px;
      font-weight: 500;
      color: var(--color-primary);
    }

    .search-field {
      width: 100%;
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 20px;
    }

    .loading-container p {
      color: var(--text-secondary);
      font-size: 15px;
    }

    /* Mobile Portfolio Cards */
    .portfolio-cards-mobile {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .portfolio-card-mobile {
      border-radius: var(--radius-lg) !important;
      box-shadow: var(--shadow-sm) !important;
      border: 1px solid var(--surface-border);
      transition: all var(--transition-base);
      overflow: hidden;
    }

    .portfolio-card-mobile.expanded {
      box-shadow: var(--shadow-md) !important;
    }

    .portfolio-card-mobile mat-card-header {
      padding: 16px;
      cursor: pointer;
      background: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
    }

    .card-header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .portfolio-title h3 {
      margin: 0 0 4px 0;
      font-size: 17px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .portfolio-title .creator {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-chip {
      background: var(--gradient-primary) !important;
      color: white !important;
      font-weight: 600;
      font-size: 13px;
      border-radius: var(--radius-full) !important;
    }

    .expand-icon {
      transition: transform var(--transition-base);
      color: var(--text-tertiary);
    }

    .expand-icon.rotated {
      transform: rotate(180deg);
    }

    /* Expandable Content */
    .expandable-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height var(--transition-slow), padding var(--transition-slow);
      padding: 0;
      background: var(--surface-bg);
    }

    .expandable-content.expanded {
      max-height: 500px;
      padding: 16px;
    }

    .expandable-content:not(.expanded) {
      padding: 0 !important;
    }

    .expandable-content:not(.expanded).mat-mdc-card-content {
      padding-bottom: 0 !important;
    }

    .portfolio-stats-mobile {
      margin-bottom: 16px;
    }

    .stat-row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .stat-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--surface-card);
      border-radius: var(--radius-md);
      border: 1px solid var(--surface-border);
      border-left: 3px solid var(--color-primary);
    }

    .stat-item.full-width {
      flex: 1;
    }

    .stat-icon {
      color: var(--color-primary);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 11px;
      color: var(--text-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin-top: 2px;
    }

    .mobile-actions {
      display: flex;
      justify-content: center;
      padding-top: 12px;
      border-top: 1px solid var(--surface-border);
    }

    .primary-action {
      min-width: 160px;
      height: 42px;
      border-radius: var(--radius-md);
      background: var(--gradient-primary) !important;
      font-weight: 600;
    }

    /* Menu Styles */
    .delete-action {
      color: var(--color-danger) !important;
    }

    /* Desktop Table */
    .table-container {
      overflow-x: auto;
      border-radius: var(--radius-lg);
      border: 1px solid var(--surface-border);
      background: var(--surface-card);
      box-shadow: var(--shadow-sm);
    }

    .portfolios-table {
      width: 100%;
    }

    .portfolios-table th {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      background: var(--surface-bg);
    }

    .portfolios-table td {
      font-size: 14px;
      color: var(--text-primary);
    }

    .portfolio-row {
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .portfolio-row:nth-child(even) {
      background: rgba(0, 0, 0, 0.01);
    }

    .portfolio-row:hover {
      background-color: var(--color-primary-50);
    }

    .portfolio-info {
      display: flex;
      flex-direction: column;
    }

    .portfolio-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary);
    }

    .portfolio-creator {
      font-size: 12px;
      color: var(--text-secondary);
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: var(--text-secondary);
    }

    .empty-state mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      margin-bottom: 16px;
      opacity: 0.3;
      color: var(--text-tertiary);
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .empty-state p {
      margin: 0 0 24px 0;
      opacity: 0.75;
    }

    /* Floating Action Button */
    .fab-create {
      position: fixed;
      bottom: calc(72px + env(safe-area-inset-bottom, 0px));
      right: 28px;
      z-index: 1000;
      background: var(--gradient-primary) !important;
      box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4) !important;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }

    .fab-create:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5) !important;
    }

    /* Responsive Design */
    @media (min-width: 769px) {
      .app-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }
    }

    @media (max-width: 480px) {
      .app-container {
        padding: 12px;
      }

      .portfolio-card-mobile mat-card-header {
        padding: 12px;
      }

      .expandable-content.expanded {
        padding: 12px;
      }

      .stat-row {
        flex-direction: column;
        gap: 8px;
      }

      .stat-item {
        padding: 10px;
      }

      .mobile-header h1 {
        font-size: 22px;
      }
    }
  `]
})
export class PortfolioListComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private breakpointObserver = inject(BreakpointObserver);

  portfolios: Portfolio[] = [];
  filteredPortfolios: Portfolio[] = [];
  isLoading = true;
  isAdmin = false;
  isMobile = false;
  expandedCard: number | null = null;
  searchControl = new FormControl('');
  displayedColumns = ['name', 'nav', 'aum', 'units', 'cash', 'investors', 'holdings', 'actions'];

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    // Setup mobile detection
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    });

    // Setup search functionality
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filterPortfolios();
    });

    this.loadPortfolios();
  }

  loadPortfolios(): void {
    this.isLoading = true;
    this.portfolioService.getPortfolios().subscribe({
      next: (response) => {
        if (response.success) {
          this.portfolios = response.data || [];
          this.filterPortfolios();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load portfolios:', error);
        this.snackBar.open('Failed to load portfolios', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  filterPortfolios(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (!searchTerm) {
      this.filteredPortfolios = [...this.portfolios];
    } else {
      this.filteredPortfolios = this.portfolios.filter(portfolio =>
        portfolio.name.toLowerCase().includes(searchTerm) ||
        portfolio.createdBy.username.toLowerCase().includes(searchTerm)
      );
    }
  }

  toggleCard(portfolioId: number): void {
    this.expandedCard = this.expandedCard === portfolioId ? null : portfolioId;
  }

  createPortfolio(): void {
    const dialogConfig: any = {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { mode: 'create' },
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    };

    if (this.isMobile) {
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.maxHeight = '100vh';
      dialogConfig.height = '100vh';
      dialogConfig.panelClass = 'mobile-fullscreen-dialog';
    }

    const dialogRef = this.dialog.open(PortfolioFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Portfolio was created successfully, reload the list
        this.loadPortfolios();
      }
    });
  }

  viewPortfolio(portfolioId: number): void {
    this.router.navigate(['/portfolios', portfolioId]);
  }

  managePortfolio(portfolioId: number): void {
    this.snackBar.open(`Manage portfolio ${portfolioId} feature coming soon!`, 'Close', { duration: 3000 });
  }

  manageFees(portfolioId: number): void {
    this.router.navigate(['/portfolios', portfolioId, 'fees']);
  }

  clonePortfolio(portfolio: Portfolio): void {
    const dialogConfig: any = {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        portfolioName: portfolio.name,
        portfolioId: portfolio.id
      },
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    };

    if (this.isMobile) {
      dialogConfig.width = '100vw';
      dialogConfig.maxWidth = '100vw';
      dialogConfig.maxHeight = '100vh';
      dialogConfig.height = '100vh';
      dialogConfig.panelClass = 'mobile-fullscreen-dialog';
    }

    const dialogRef = this.dialog.open(ClonePortfolioDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.newPortfolioName) {
        this.performClone(portfolio.id, result.newPortfolioName);
      }
    });
  }

  private performClone(portfolioId: number, newPortfolioName: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      return;
    }

    this.portfolioService.clonePortfolio(portfolioId, newPortfolioName, currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            `Portfolio cloned successfully as "${response.data?.name}"`,
            'Close',
            { duration: 5000, panelClass: ['success-snackbar'] }
          );
          this.loadPortfolios();
        } else {
          this.snackBar.open(
            response.message || 'Failed to clone portfolio',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      },
      error: (error) => {
        const message = error?.error?.message || 'Failed to clone portfolio';
        this.snackBar.open(message, 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
        console.error('Clone portfolio failed:', error);
      }
    });
  }

  deletePortfolio(portfolioId: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this portfolio? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    this.portfolioService.deletePortfolio(portfolioId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(response.message || 'Portfolio deleted successfully', 'Close', { duration: 4000 });
          this.loadPortfolios();
        } else {
          this.snackBar.open(response.message || 'Failed to delete portfolio', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        const message = error?.error?.message || 'Failed to delete portfolio';
        this.snackBar.open(message, 'Close', { duration: 6000 });
        console.error('Delete portfolio failed:', error);
      }
    });
  }

}
