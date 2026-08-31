import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule, Router } from '@angular/router';

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { UserDashboard, ActiveInvestment } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatRippleModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      @if (isLoading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading your dashboard...</p>
        </div>
      } @else if (dashboardData) {
        <!-- Investment Summary -->
        <div class="summary-section">
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title>Investment Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-value">{{ dashboardData.investmentSummary.portfolioCount }}</div>
                  <div class="summary-label">Active Portfolios</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{ dashboardData.investmentSummary.totalInvested | currency:'INR':'symbol':'1.2-2' }}</div>
                  <div class="summary-label">Total Invested</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{ dashboardData.investmentSummary.currentValue | currency:'INR':'symbol':'1.2-2' }}</div>
                  <div class="summary-label">Current Value</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value" [class.positive]="dashboardData.investmentSummary.totalReturns >= 0"
                       [class.negative]="dashboardData.investmentSummary.totalReturns < 0">
                    {{ dashboardData.investmentSummary.totalReturns | currency:'INR':'symbol':'1.2-2' }}
                  </div>
                  <div class="summary-label">Total Returns</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value" [class.positive]="dashboardData.investmentSummary.returnPercentage >= 0"
                       [class.negative]="dashboardData.investmentSummary.returnPercentage < 0">
                    {{ dashboardData.investmentSummary.returnPercentage | number:'1.2-2' }}%
                  </div>
                  <div class="summary-label">Return %</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{ dashboardData.investmentSummary.totalCharges | currency:'INR':'symbol':'1.2-2' }}</div>
                  <div class="summary-label">Total Charges</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Active Investments -->
        <div class="dashboard-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Your Investments</mat-card-title>
              <div class="card-actions">
                <button mat-button routerLink="/portfolios">View All</button>
              </div>
            </mat-card-header>
            <mat-card-content>
              @if (dashboardData.activeInvestments && dashboardData.activeInvestments.length > 0) {
                <div class="table-container">
                  <table mat-table [dataSource]="dashboardData.activeInvestments" class="investments-table">
                    <ng-container matColumnDef="portfolio">
                      <th mat-header-cell *matHeaderCellDef>Portfolio</th>
                      <td mat-cell *matCellDef="let investment">
                        <div class="portfolio-info">
                          <div class="portfolio-name">Portfolio #{{ investment.portfolioId }}</div>
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="units">
                      <th mat-header-cell *matHeaderCellDef>Units</th>
                      <td mat-cell *matCellDef="let investment">
                        {{ investment.units | number:'1.4-4' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="invested">
                      <th mat-header-cell *matHeaderCellDef>Invested</th>
                      <td mat-cell *matCellDef="let investment">
                        {{ investment.totalInvested | currency:'INR':'symbol':'1.2-2' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="current">
                      <th mat-header-cell *matHeaderCellDef>Current Value</th>
                      <td mat-cell *matCellDef="let investment">
                        {{ investment.currentValue | currency:'INR':'symbol':'1.2-2' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="returns">
                      <th mat-header-cell *matHeaderCellDef>Returns</th>
                      <td mat-cell *matCellDef="let investment">
                        <div class="returns-info">
                          <div class="return-amount" [class.positive]="investment.totalReturns >= 0"
                               [class.negative]="investment.totalReturns < 0">
                            {{ investment.totalReturns | currency:'INR':'symbol':'1.2-2' }}
                          </div>
                          <div class="return-percentage" [class.positive]="investment.returnPercentage >= 0"
                               [class.negative]="investment.returnPercentage < 0">
                            ({{ investment.returnPercentage | number:'1.2-2' }}%)
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="investmentColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: investmentColumns;"></tr>
                  </table>
                </div>
              } @else {
                <div class="no-data">
                  <mat-icon>pie_chart</mat-icon>
                  <p>No active investments</p>
                  <p class="no-data-subtitle">Contact your administrator to get started</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Stats -->
        <div class="dashboard-section">
          <div class="stats-grid">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-header">
                  <mat-icon class="stat-icon">receipt_long</mat-icon>
                  <div class="stat-info">
                    <div class="stat-value">{{ dashboardData.recentTransactionsCount }}</div>
                    <div class="stat-label">Recent Transactions</div>
                  </div>
                </div>
                <button mat-button routerLink="/transactions" class="stat-action">
                  View Details
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </mat-card-content>
            </mat-card>

            @if (dashboardData.topInvestments && dashboardData.topInvestments.length > 0) {
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-header">
                    <mat-icon class="stat-icon">trending_up</mat-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ getTopInvestmentReturn() | number:'1.2-2' }}%</div>
                      <div class="stat-label">Best Performing</div>
                    </div>
                  </div>
                  <button mat-button routerLink="/portfolios" class="stat-action">
                    View Portfolios
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </mat-card-content>
              </mat-card>
            }
          </div>
        </div>
      } @else {
        <div class="error-container">
          <mat-icon>error</mat-icon>
          <p>Failed to load dashboard data</p>
          <button mat-raised-button color="primary" (click)="loadDashboard()">Retry</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeInUp 0.4s ease-out;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .loading-container, .error-container {
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

    .error-container mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--color-danger);
      margin-bottom: 16px;
    }

    .summary-section {
      margin-bottom: 28px;
    }

    .summary-card {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%) !important;
      color: white;
      border: none !important;
      box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3) !important;
    }

    .summary-card mat-card-title {
      color: white;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      letter-spacing: -0.01em;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
    }

    .summary-item {
      text-align: center;
      padding: 16px 12px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-md);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: background var(--transition-fast);
    }

    .summary-item:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .summary-value {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }

    .summary-value.positive {
      color: #34d399;
    }

    .summary-value.negative {
      color: #fca5a5;
    }

    .summary-label {
      font-size: 11px;
      opacity: 0.85;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    .dashboard-section {
      margin-bottom: 28px;
    }

    .dashboard-section mat-card-title {
      font-size: 17px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .card-actions {
      margin-left: auto;
    }

    .card-actions button {
      color: var(--color-primary);
      font-weight: 500;
      font-size: 13px;
    }

    .table-container {
      overflow-x: auto;
    }

    .investments-table {
      width: 100%;
    }

    .investments-table tr.mat-mdc-row:nth-child(even) {
      background: rgba(0, 0, 0, 0.015);
    }

    .investments-table tr.mat-mdc-row:hover {
      background: var(--color-primary-50);
    }

    .investments-table th {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
    }

    .portfolio-info {
      display: flex;
      flex-direction: column;
    }

    .portfolio-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .returns-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .return-amount {
      font-weight: 600;
    }

    .return-percentage {
      font-size: 12px;
      opacity: 0.7;
    }

    .return-amount.positive, .return-percentage.positive {
      color: var(--color-success);
    }

    .return-amount.negative, .return-percentage.negative {
      color: var(--color-danger);
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: var(--text-secondary);
      text-align: center;
    }

    .no-data mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      margin-bottom: 16px;
      opacity: 0.3;
      color: var(--text-tertiary);
    }

    .no-data-subtitle {
      font-size: 14px;
      opacity: 0.7;
      margin-top: 8px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .stat-card {
      transition: transform var(--transition-base), box-shadow var(--transition-base);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg) !important;
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      padding: 14px;
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-value {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .stat-action {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
      color: var(--color-primary);
      font-weight: 500;
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .summary-value {
        font-size: 16px;
      }
    }

    @media (max-width: 480px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);

  dashboardData: UserDashboard | null = null;
  isLoading = true;
  investmentColumns = ['portfolio', 'units', 'invested', 'current', 'returns'];

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.dashboardService.getUserDashboard(currentUser.id).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load user dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  getTopInvestmentReturn(): number {
    if (!this.dashboardData?.topInvestments?.length) {
      return 0;
    }
    return Math.max(...this.dashboardData.topInvestments.map(inv => inv.returnPercentage));
  }
}
