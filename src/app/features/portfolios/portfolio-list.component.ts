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
    MatTooltipModule
  ],
  template: `
    <div class="portfolio-container">
      

      @if (isLoading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading portfolios...</p>
        </div>
      } @else if (portfolios.length > 0) {
        <!-- Portfolio Cards for Mobile -->
        <div class="portfolio-cards mobile-only">
          @for (portfolio of portfolios; track portfolio.id) {
            <mat-card class="portfolio-card" (click)="viewPortfolio(portfolio.id)">
              <mat-card-header>
                <mat-card-title>{{ portfolio.name }}</mat-card-title>
                <mat-card-subtitle>Created by {{ portfolio.createdBy.username }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="portfolio-stats">
                  <div class="stat">
                    <span class="stat-label">NAV</span>
                    <span class="stat-value">{{ portfolio.navValue | currency:'INR':'symbol':'1.4-4' }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Total AUM</span>
                    <span class="stat-value">{{ portfolio.totalAum | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Investors</span>
                    <span class="stat-value">{{ portfolio.totalInvestors }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Holdings</span>
                    <span class="stat-value">{{ portfolio.totalHoldings }}</span>
                  </div>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary" (click)="viewPortfolio(portfolio.id); $event.stopPropagation()">View Details</button>
                @if (isAdmin) {
                  <button mat-button (click)="managePortfolio(portfolio.id); $event.stopPropagation()">Manage</button>
                  <button mat-button color="warn" (click)="manageFees(portfolio.id); $event.stopPropagation()">Fees</button>
                  <button mat-button color="accent" (click)="clonePortfolio(portfolio); $event.stopPropagation()">
                    <mat-icon>content_copy</mat-icon>
                    Clone
                  </button>
                  <button mat-button color="warn" (click)="deletePortfolio(portfolio.id); $event.stopPropagation()">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>

        <!-- Portfolio Table for Desktop -->
        <mat-card class="desktop-only">
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="portfolios" class="portfolios-table">
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
                    <button mat-icon-button color="primary" (click)="viewPortfolio(portfolio.id)"
                            matTooltip="View Details">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    @if (isAdmin) {
                      <button mat-icon-button color="accent" (click)="managePortfolio(portfolio.id)"
                              matTooltip="Manage Portfolio">
                        <mat-icon>settings</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="manageFees(portfolio.id)"
                              matTooltip="Manage Fees">
                        <mat-icon>account_balance_wallet</mat-icon>
                      </button>
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
      } @else {
        <div class="no-data">
          <mat-icon>pie_chart</mat-icon>
          <h3>No Portfolios Found</h3>
          <p>There are no portfolios available at the moment.</p>
          @if (isAdmin) {
            <button mat-raised-button color="primary" (click)="createPortfolio()">
              <mat-icon>add</mat-icon>
              Create First Portfolio
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .portfolio-container {
      max-width: 1200px;
      margin: 0 auto;
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

    .portfolio-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .portfolio-card {
      cursor: pointer;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .portfolio-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .portfolio-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 16px 0;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .table-container {
      overflow-x: auto;
    }

    .portfolios-table {
      width: 100%;
    }

    .portfolio-row {
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
    }

    .portfolio-row:hover {
      background-color: #f5f5f5;
    }

    .portfolio-info {
      display: flex;
      flex-direction: column;
    }

    .portfolio-name {
      font-weight: 500;
      font-size: 14px;
    }

    .portfolio-creator {
      font-size: 12px;
      color: #666;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-data h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
    }

    .no-data p {
      margin: 0 0 24px 0;
      opacity: 0.7;
    }

    .mobile-only {
      display: none;
    }

    .desktop-only {
      display: block;
    }

    @media (max-width: 768px) {
      .mobile-only {
        display: grid;
      }

      .desktop-only {
        display: none;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .page-header h1 {
        text-align: center;
      }

      .portfolio-cards {
        grid-template-columns: 1fr;
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

  portfolios: Portfolio[] = [];
  isLoading = true;
  isAdmin = false;
  displayedColumns = ['name', 'nav', 'aum', 'units', 'cash', 'investors', 'holdings', 'actions'];

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadPortfolios();
  }

  loadPortfolios(): void {
    this.isLoading = true;
    this.portfolioService.getPortfolios().subscribe({
      next: (response) => {
        if (response.success) {
          this.portfolios = response.data || [];
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

  createPortfolio(): void {
    const dialogRef = this.dialog.open(PortfolioFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { mode: 'create' },
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

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
    const dialogRef = this.dialog.open(ClonePortfolioDialogComponent, {
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
    });

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
