import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule, Router } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, interval } from 'rxjs';

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { UserDashboard, ActiveInvestment, NavHistoryItem } from '../../core/models/dashboard.model';
import { NavHistoryChartComponent } from '../../shared/components/nav-history-chart/nav-history-chart.component';

@Component({
  selector: 'app-user-dashboard-mobile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    RouterModule,
    MatRippleModule,
    MatDividerModule,
    MatTabsModule,
    MatBadgeModule,
    NavHistoryChartComponent
  ],
  template: `
    <div class="mobile-dashboard">
      <!-- Pull to refresh indicator -->
      <div class="refresh-indicator" [class.active]="isRefreshing">
        <mat-spinner diameter="24"></mat-spinner>
      </div>

      @if (isLoading && !dashboardData) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading your investments...</p>
        </div>
      } @else if (dashboardData) {
        <!-- Summary Header -->
        <div class="summary-header">


          <div class="summary-cards">
            <div class="summary-card total-value">
              <div class="card-icon">
                <mat-icon>account_balance</mat-icon>
              </div>
              <div class="card-content">
                <div class="card-label">Total Value</div>
                <div class="card-value">{{ dashboardData.investmentSummary.currentValue | currency:'INR':'symbol':'1.0-0' }}</div>
                <div class="card-change" [class.positive]="dashboardData.investmentSummary.totalReturns >= 0"
                     [class.negative]="dashboardData.investmentSummary.totalReturns < 0">
                  <mat-icon>{{ dashboardData.investmentSummary.totalReturns >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ dashboardData.investmentSummary.returnPercentage | number:'1.2-2' }}%
                </div>


              </div>

            </div>

            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-value">{{ dashboardData.investmentSummary.portfolioCount }}</span>
                <span class="stat-label">Portfolios</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ dashboardData.investmentSummary.totalInvested | currency:'INR':'symbol':'1.0-0' }}</span>
                <span class="stat-label">Invested</span>
              </div>
              <div class="stat-item">
                <span class="stat-value" [class.positive]="dashboardData.investmentSummary.totalReturns >= 0"
                     [class.negative]="dashboardData.investmentSummary.totalReturns < 0">
                  {{ dashboardData.investmentSummary.totalReturns | currency:'INR':'symbol':'1.0-0' }}
                </span>
                <span class="stat-label">Returns</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Portfolio Cards -->
        <div class="section">
          @if (dashboardData.activeInvestments && dashboardData.activeInvestments.length > 0) {
            <div class="portfolio-cards">
              @for (investment of dashboardData.activeInvestments; track investment.portfolio.id) {
                <mat-card class="portfolio-card">
                  <mat-divider></mat-divider>


                  <div class="portfolio-chart-preview">
                    <app-nav-history-chart
                      [navHistory]="portfolioNavHistory[investment.portfolio.id]"
                      [portfolioId]="investment.portfolio.id"
                      [isLoading]="loadingNavHistory[investment.portfolio.id]"
                      [units]="investment.unitsHeld">
                    </app-nav-history-chart>
                  </div>


                  <div class="portfolio-footer">
                    @if(dashboardData.activeInvestments.length > 0) {
                      <mat-chip class="update-chip">
                        <mat-icon class="chip-icon">schedule</mat-icon>
                        Updated {{ getRelativeTime(dashboardData.activeInvestments[0].updatedAt) }}
                      </mat-chip>
                    }
                  </div>
                </mat-card>
              }
            </div>
          } @else {
            <mat-card class="empty-state">
              <mat-icon>account_balance_wallet</mat-icon>
              <h4>No Active Investments</h4>
              <p>Contact your administrator to start investing</p>
            </mat-card>
          }
        </div>


        <!-- Transactions Button -->
        @if (dashboardData.activeInvestments && dashboardData.activeInvestments.length > 0) {
          <div class="transactions-footer">
            <button mat-fab color="primary"
                    [routerLink]="['/transactions']"
                    [queryParams]="{portfolio: dashboardData.activeInvestments[0].portfolio.id}"
                    class="transactions-button">
              <mat-icon>receipt_long</mat-icon>
            </button>
          </div>
        }

        <!-- Bottom Navigation Hint -->
        <div class="bottom-hint">
          <p>Swipe between sections or use the navigation menu</p>
        </div>
      } @else {
        <div class="error-container">
          <mat-icon>error_outline</mat-icon>
          <h3>Unable to load dashboard</h3>
          <p>Please check your connection and try again</p>
          <button mat-raised-button color="primary" (click)="loadDashboard()">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .mobile-dashboard {
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
      padding-bottom: 20px;
    }

    .refresh-indicator {
      position: fixed;
      top: 64px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      background: white;
      border-radius: 50%;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .refresh-indicator.active {
      opacity: 1;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 64px);
      padding: 20px;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 20px;
    }

    .error-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 20px;
    }

    .error-container h3 {
      margin: 0 0 10px;
      color: #333;
    }

    .error-container p {
      color: #666;
      margin-bottom: 20px;
    }

    .summary-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 16px 24px;
      border-radius: 0 0 24px 24px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .user-greeting h2 {
      margin: 0 0 4px;
      font-size: 24px;
      font-weight: 500;
    }

    .user-greeting p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .summary-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(102, 126, 234, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-icon mat-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .card-content {
      flex: 1;
    }

    .card-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .card-value {
      font-size: 28px;
      font-weight: 600;
      color: #333;
      line-height: 1;
    }

    .card-change {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    .card-change mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .card-change.positive {
      color: #4caf50;
    }

    .card-change.negative {
      color: #f44336;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .summary-stats .stat-item {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 12px;
      text-align: center;
    }

    .stat-item .stat-value {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-item .stat-value.positive {
      color: #4caf50;
    }

    .stat-item .stat-value.negative {
      color: #f44336;
    }

    .stat-item .stat-label {
      display: block;
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 16px;
      background: white;
      margin-top: -12px;
      border-radius: 12px 12px 0 0;
    }

    .action-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 8px;
      border-radius: 12px;
      transition: background 0.2s;
    }

    .action-button:active {
      background: rgba(0, 0, 0, 0.05);
    }

    .action-button mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #667eea;
    }

    .action-button span {
      font-size: 11px;
      color: #666;
    }


    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .section-subtitle {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }

    .portfolio-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .portfolio-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      overflow: hidden;
    }

    .portfolio-card:active {
      transform: scale(0.98);
    }

    .portfolio-card.expanded {
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .portfolio-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .portfolio-info h4 {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .portfolio-units {
      margin: 0;
      font-size: 13px;
      color: #666;
    }

    .portfolio-arrow {
      color: #999;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .portfolio-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 16px;
    }

    .portfolio-stats .stat {
      text-align: center;
    }

    .portfolio-stats .stat-label {
      display: block;
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .portfolio-stats .stat-value {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .portfolio-stats .stat-value.positive {
      color: #4caf50;
    }

    .portfolio-stats .stat-value.negative {
      color: #f44336;
    }

    .portfolio-chart-preview {
      //padding: 0 16px;
    }

    .portfolio-chart-preview.expanded {
      margin-bottom: 0;
    }

    .expanded-details {
      background: #f8f9fa;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
      }
      to {
        opacity: 1;
        max-height: 500px;
      }
    }

    .detail-section {
      padding: 16px;
    }

    .detail-section h5 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .detail-item {
      background: white;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }

    .detail-label {
      display: block;
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .detail-value {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .detail-value.positive {
      color: #4caf50;
    }

    .detail-value.negative {
      color: #f44336;
    }

    .performance-metrics {
      display: flex;
      gap: 12px;
    }

    .metric-card {
      flex: 1;
      background: white;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 4px solid #4caf50;
    }

    .metric-card.loss {
      border-left-color: #f44336;
    }

    .metric-card mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #4caf50;
    }

    .metric-card.loss mat-icon {
      color: #f44336;
    }

    .metric-info {
      flex: 1;
    }

    .metric-label {
      display: block;
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .metric-value {
      display: block;
      font-size: 18px;
      font-weight: 600;
      color: #4caf50;
    }

    .metric-card.loss .metric-value {
      color: #f44336;
    }

    .detail-actions {
      padding: 16px;
      border-top: 1px solid #e9ecef;
      background: white;
    }

    .detail-actions button {
      width: 100%;
      height: 44px;
      border-radius: 8px;
    }

    .portfolio-footer {
      padding: 12px 16px;
      background: #f5f5f5;
    }

    .update-chip {
      font-size: 11px;
      height: 24px;
      padding: 0 8px;
    }

    .chip-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      margin-right: 4px;
    }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      opacity: 0.3;
    }

    .empty-state h4 {
      margin: 0 0 8px;
      font-size: 18px;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    .top-performers {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .performer-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .performer-card:active {
      transform: scale(0.98);
    }

    .performer-rank {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .performer-info {
      flex: 1;
    }

    .performer-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .performer-return {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 16px;
      font-weight: 600;
    }

    .performer-return mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .performer-return.positive {
      color: #4caf50;
    }

    .performer-return.negative {
      color: #f44336;
    }

    .performer-arrow {
      color: #999;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .transactions-footer {
      position: fixed;
      bottom: 80px;
      right: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 100;
    }

    .transactions-button {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .transactions-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .button-label {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
      font-weight: 500;
      text-align: center;
    }

    .bottom-hint {
      padding: 20px;
      text-align: center;
      margin-bottom: 80px;
    }

    .bottom-hint p {
      margin: 0;
      font-size: 12px;
      color: #999;
    }

    @media (max-width: 380px) {
      .summary-card .card-value {
        font-size: 24px;
      }

      .quick-actions {
        grid-template-columns: repeat(2, 1fr);
      }

      .portfolio-stats {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .portfolio-stats .stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .portfolio-stats .stat-label {
        margin-bottom: 0;
      }
    }
  `]
})
export class UserDashboardMobileComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  dashboardData: UserDashboard | null = null;
  portfolioNavHistory: { [key: number]: NavHistoryItem[] } = {};
  loadingNavHistory: { [key: number]: boolean } = {};
  expandedCards: { [key: number]: boolean } = {};
  isLoading = true;
  isRefreshing = false;

  ngOnInit(): void {
    this.loadDashboard();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.dashboardService.getUserDashboard(currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Handle the API response structure
          if (response && typeof response === 'object' && 'data' in response) {
            this.dashboardData = (response as any).data;
          } else {
            this.dashboardData = response;
          }
          this.isLoading = false;
          this.loadPortfolioNavHistories();
        },
        error: (error) => {
          console.error('Failed to load user dashboard:', error);
          this.isLoading = false;
        }
      });
  }

  loadPortfolioNavHistories(): void {
    if (!this.dashboardData?.activeInvestments) return;

    // Calculate date range for NAV history (last 3 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    this.dashboardData.activeInvestments.forEach(investment => {
      const portfolioId = investment.portfolio.id;
      this.loadingNavHistory[portfolioId] = true;

      this.dashboardService.getNavHistory(
        investment.portfolio.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.portfolioNavHistory[portfolioId] = response.data || [];
            this.loadingNavHistory[portfolioId] = false;
          },
          error: (error) => {
            console.error(`Failed to load NAV history for portfolio ${portfolioId}:`, error);
            this.portfolioNavHistory[portfolioId] = [];
            this.loadingNavHistory[portfolioId] = false;
          }
        });
    });
  }

  refreshDashboard(): void {
    this.isRefreshing = true;
    this.loadDashboard();

    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000);
  }

  setupAutoRefresh(): void {
    // Auto-refresh every 5 minutes
    interval(5 * 60 * 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboard();
      });
  }

  toggleCardExpansion(portfolioId: number): void {
    this.expandedCards[portfolioId] = !this.expandedCards[portfolioId];
  }

  navigateToPortfolio(portfolioId: number): void {
    // For non-admin users, we now use expandable cards instead of navigation
    this.toggleCardExpansion(portfolioId);
  }

  getRelativeTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
