import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { UserDashboard } from '../../core/models/dashboard.model';

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
                  <div class="summary-value">{{ dashboardData.investmentSummary.totalInvested | currency:'USD':'symbol':'1.2-2' }}</div>
                  <div class="summary-label">Total Invested</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{ dashboardData.investmentSummary.currentValue | currency:'USD':'symbol':'1.2-2' }}</div>
                  <div class="summary-label">Current Value</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value" [class.positive]="dashboardData.investmentSummary.totalReturns >= 0"
                       [class.negative]="dashboardData.investmentSummary.totalReturns < 0">
                    {{ dashboardData.investmentSummary.totalReturns | currency:'USD':'symbol':'1.2-2' }}
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
                  <div class="summary-value">{{ dashboardData.investmentSummary.totalCharges | currency:'USD':'symbol':'1.2-2' }}</div>
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
                        {{ investment.totalInvested | currency:'USD':'symbol':'1.2-2' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="current">
                      <th mat-header-cell *matHeaderCellDef>Current Value</th>
                      <td mat-cell *matCellDef="let investment">
                        {{ investment.currentValue | currency:'USD':'symbol':'1.2-2' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="returns">
                      <th mat-header-cell *matHeaderCellDef>Returns</th>
                      <td mat-cell *matCellDef="let investment">
                        <div class="returns-info">
                          <div class="return-amount" [class.positive]="investment.totalReturns >= 0"
                               [class.negative]="investment.totalReturns < 0">
                            {{ investment.totalReturns | currency:'USD':'symbol':'1.2-2' }}
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
    }

    .loading-container, .error-container {
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

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .summary-section {
      margin-bottom: 30px;
    }

    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .summary-card mat-card-title {
      color: white;
      font-size: 20px;
      margin-bottom: 20px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    }

    .summary-item {
      text-align: center;
      padding: 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    .summary-value {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .summary-value.positive {
      color: #4caf50;
    }

    .summary-value.negative {
      color: #f44336;
    }

    .summary-label {
      font-size: 12px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dashboard-section {
      margin-bottom: 30px;
    }

    .card-actions {
      margin-left: auto;
    }

    .table-container {
      overflow-x: auto;
    }

    .investments-table {
      width: 100%;
    }

    .portfolio-info {
      display: flex;
      flex-direction: column;
    }

    .portfolio-name {
      font-weight: 500;
    }

    .returns-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .return-amount {
      font-weight: 500;
    }

    .return-percentage {
      font-size: 12px;
      opacity: 0.7;
    }

    .return-amount.positive, .return-percentage.positive {
      color: #4caf50;
    }

    .return-amount.negative, .return-percentage.negative {
      color: #f44336;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #666;
      text-align: center;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-data-subtitle {
      font-size: 14px;
      opacity: 0.7;
      margin-top: 8px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .stat-card {
      transition: transform 0.2s ease-in-out;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      padding: 12px;
      border-radius: 50%;
      background: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .stat-action {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
    }

    @media (max-width: 768px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .stats-grid {
        grid-template-columns: 1fr;
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
