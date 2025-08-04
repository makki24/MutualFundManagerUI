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

import { PortfolioService } from '../../core/services/portfolio.service';
import { AuthService } from '../../core/services/auth.service';
import { Portfolio } from '../../core/models/portfolio.model';

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
      <div class="page-header">
        <h1>Portfolios</h1>
        @if (isAdmin) {
          <button mat-raised-button color="primary" (click)="createPortfolio()">
            <mat-icon>add</mat-icon>
            Create Portfolio
          </button>
        }
      </div>

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
                    <span class="stat-value">{{ portfolio.navValue | currency:'USD':'symbol':'1.4-4' }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Total AUM</span>
                    <span class="stat-value">{{ portfolio.totalAum | currency:'USD':'symbol':'1.0-0' }}</span>
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
                    {{ portfolio.navValue | currency:'USD':'symbol':'1.4-4' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="aum">
                  <th mat-header-cell *matHeaderCellDef>Total AUM</th>
                  <td mat-cell *matCellDef="let portfolio">
                    {{ portfolio.totalAum | currency:'USD':'symbol':'1.0-0' }}
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
                    {{ portfolio.remainingCash | currency:'USD':'symbol':'1.0-0' }}
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

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
      color: #333;
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
    this.snackBar.open('Create Portfolio feature coming soon! This will open a form to create a new portfolio.', 'Close', {
      duration: 5000,
      panelClass: ['warning-snackbar']
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
}
