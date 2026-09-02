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
    <div class="mobile-dashboard"
         (touchstart)="onTouchStart($event)"
         (touchmove)="onTouchMove($event)">
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
                <span class="stat-value">{{ getTotalUnits() | number:'1.2-2' }}</span>
                <span class="stat-label">Units</span>
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
                    <mat-chip class="update-chip">
                      <mat-icon class="chip-icon">schedule</mat-icon>
                      Updated {{ getRelativeTime(investment.updatedAt) }}
                    </mat-chip>
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
            <button mat-fab extended color="primary"
                    [routerLink]="['/transactions']"
                    class="transactions-button"
                    matTooltip="View Transactions">
              <mat-icon>receipt_long</mat-icon>
              Transactions
            </button>
          </div>
        }

        <!-- Bottom spacer -->
        <div class="bottom-hint"></div>
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
      min-height: calc(100vh - 56px);
      background: var(--surface-bg);
      padding-bottom: 20px;
    }

    .refresh-indicator {
      position: fixed;
      top: 56px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      background: var(--surface-card);
      border-radius: var(--radius-full);
      padding: 8px;
      box-shadow: var(--shadow-lg);
      opacity: 0;
      transition: opacity var(--transition-base);
    }

    .refresh-indicator.active { opacity: 1; }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 56px);
      padding: 20px;
      text-align: center;
    }

    .loading-container mat-spinner { margin-bottom: 20px; }
    .loading-container p { color: var(--text-secondary); }

    .error-container mat-icon {
      font-size: 56px; width: 56px; height: 56px;
      color: var(--color-danger); margin-bottom: 20px;
    }
    .error-container h3 { margin: 0 0 10px; color: var(--text-primary); }
    .error-container p { color: var(--text-secondary); margin-bottom: 20px; }

    .summary-header {
      background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #6d28d9 100%);
      color: white;
      padding: 20px 16px 24px;
      border-radius: 0 0 var(--radius-xl) var(--radius-xl);
      box-shadow: 0 8px 32px rgba(67, 56, 202, 0.3);
    }

    .summary-card {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .card-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.15);
      display: flex; align-items: center; justify-content: center;
    }
    .card-icon mat-icon { color: #c4b5fd; font-size: 24px; width: 24px; height: 24px; }

    .card-content { flex: 1; }
    .card-label { font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
    .card-value { font-size: 28px; font-weight: 700; color: #fff; line-height: 1; letter-spacing: -1px; }

    .card-change {
      display: flex; align-items: center; gap: 4px;
      margin-top: 8px; font-size: 14px; font-weight: 600;
    }
    .card-change mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .card-change.positive { color: #34d399; }
    .card-change.negative { color: #fca5a5; }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .summary-stats .stat-item {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-md);
      padding: 12px 8px;
      text-align: center;
    }

    .stat-item .stat-value { display: block; font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
    .stat-item .stat-value.positive { color: #34d399; }
    .stat-item .stat-value.negative { color: #fca5a5; }
    .stat-item .stat-label { display: block; font-size: 10px; color: rgba(255,255,255,0.65); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }

    .section { padding: 16px; }

    .portfolio-cards { display: flex; flex-direction: column; gap: 16px; }

    .portfolio-card {
      cursor: pointer;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      overflow: hidden;
      border-radius: var(--radius-lg) !important;
    }
    .portfolio-card:active { transform: scale(0.98); }

    .portfolio-chart-preview { }

    .portfolio-footer {
      padding: 12px 16px;
      background: var(--surface-bg);
      border-top: 1px solid var(--surface-border);
    }

    .update-chip { font-size: 11px; height: 24px; padding: 0 8px; }
    .chip-icon { font-size: 14px; width: 14px; height: 14px; margin-right: 4px; }

    .empty-state {
      padding: 48px 20px; text-align: center; color: var(--text-secondary);
      border-radius: var(--radius-lg) !important;
    }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; margin: 0 auto 16px; opacity: 0.25; color: var(--text-tertiary); }
    .empty-state h4 { margin: 0 0 8px; font-size: 18px; color: var(--text-primary); font-weight: 600; }
    .empty-state p { margin: 0; font-size: 14px; }

    .transactions-footer {
      position: fixed; bottom: calc(72px + env(safe-area-inset-bottom, 0px)); right: 20px;
      display: flex; flex-direction: column; align-items: center; z-index: 100;
    }
    .transactions-button {
      box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4) !important;
      background: var(--gradient-primary) !important;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }
    .transactions-button:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5) !important;
    }

    .bottom-hint { padding: 20px; text-align: center; margin-bottom: 80px; }
    .bottom-hint p { margin: 0; font-size: 12px; color: var(--text-tertiary); }

    @media (max-width: 380px) {
      .summary-card .card-value { font-size: 24px; }
      .summary-stats .stat-item .stat-value { font-size: 13px; }
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

  touchStartY = 0;

  onTouchStart(event: TouchEvent): void {
    if (window.scrollY === 0) {
      this.touchStartY = event.touches[0].clientY;
    } else {
      this.touchStartY = 0;
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (this.touchStartY > 0 && !this.isRefreshing) {
      const currentY = event.touches[0].clientY;
      const pullDistance = currentY - this.touchStartY;
      if (pullDistance > 70 && window.scrollY === 0) {
        this.refreshDashboard();
        this.touchStartY = 0;
      }
    }
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

  getTotalUnits(): number {
    if (!this.dashboardData?.activeInvestments) return 0;
    return this.dashboardData.activeInvestments.reduce((sum, inv) => sum + (inv.unitsHeld || 0), 0);
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
