import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { PortfolioService } from '../../../core/services/portfolio.service';
import { InvestmentService } from '../../../core/services/investment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Portfolio } from '../../../core/models/portfolio.model';
import { Investment } from '../../../core/models/investment.model';
import { AddUserToPortfolioDialogComponent } from './add-user-to-portfolio-dialog/add-user-to-portfolio-dialog.component';
import { WithdrawUserDialogComponent } from './withdraw-user-dialog/withdraw-user-dialog.component';
import { InvestMoreDialogComponent } from './invest-more-dialog/invest-more-dialog.component';
import { ToolbarService } from '../../../layout/toolbar/toolbar.service';
import { PortfolioDetailsToolbarControlsComponent } from './portfolio-details-toolbar-controls.component';
import { NavHistoryChartComponent } from '../../../shared/components/nav-history-chart/nav-history-chart.component';
import { DashboardService } from '../../../core/services/dashboard.service';
import { NavHistoryItem } from '../../../core/models/dashboard.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-portfolio-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    NavHistoryChartComponent
  ],
  template: `
    <div class="portfolio-details-container">
      @if (isLoading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading portfolio details...</p>
        </div>
      } @else if (portfolio) {
        <!-- Mobile Toolbar - Only shown on mobile devices -->
        @if (isMobile) {
          <div class="mobile-toolbar">
            <h2 class="mobile-title">{{ portfolio.name }}</h2>
            <button
              mat-icon-button
              [matMenuTriggerFor]="mobileActionsMenu"
              class="mobile-menu-trigger"
              matTooltip="Actions"
            >
              <mat-icon>more_vert</mat-icon>
            </button>

            <mat-menu #mobileActionsMenu="matMenu" class="mobile-actions-menu">
              <button mat-menu-item (click)="viewTransactions()">
                <mat-icon>receipt_long</mat-icon>
                <span>View Transactions</span>
              </button>
              @if (isAdmin) {
                <button mat-menu-item (click)="manageCharges()">
                  <mat-icon>account_balance</mat-icon>
                  <span>Transaction Charges</span>
                </button>
                <button mat-menu-item (click)="manageFees()">
                  <mat-icon>account_balance_wallet</mat-icon>
                  <span>Manage Fees</span>
                </button>
                <button mat-menu-item (click)="manageHoldings()">
                  <mat-icon>pie_chart</mat-icon>
                  <span>Manage Holdings</span>
                </button>
              }
            </mat-menu>
          </div>
        }

        <!-- Portfolio Stats card -->
        @if (isMobile) {
          <!-- Mobile Collapsible Stats -->
          <mat-expansion-panel class="mobile-stats-panel" [expanded]="statsExpanded">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <div class="mobile-stats-header">
                  <div class="key-stats">
                    <span class="nav-value">₹{{ portfolio.navValue | number:'1.2-2' }}</span>
                    <span class="aum-value">AUM: {{ portfolio.totalAum | currency:'INR':'symbol':'1.0-0' }}</span>
                  </div>
                  <mat-icon>{{ statsExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                </div>
              </mat-panel-title>
            </mat-expansion-panel-header>
            <div class="mobile-stats-content">
              <div class="stats-grid-mobile">
                <div class="stat-card-mobile">
                  <mat-icon class="stat-icon">account_balance</mat-icon>
                  <div class="stat-info">
                    <div class="stat-label">NAV</div>
                    <div class="stat-value">{{ portfolio.navValue | currency:'INR':'symbol':'1.4-4' }}</div>
                  </div>
                </div>
                <div class="stat-card-mobile">
                  <mat-icon class="stat-icon">account_balance_wallet</mat-icon>
                  <div class="stat-info">
                    <div class="stat-label">Total AUM</div>
                    <div class="stat-value">{{ portfolio.totalAum | currency:'INR':'symbol':'1.0-0' }}</div>
                  </div>
                </div>
                <div class="stat-card-mobile">
                  <mat-icon class="stat-icon">trending_up</mat-icon>
                  <div class="stat-info">
                    <div class="stat-label">Total Units</div>
                    <div class="stat-value">{{ portfolio.totalUnits | number:'1.4-4' }}</div>
                  </div>
                </div>
                <div class="stat-card-mobile">
                  <mat-icon class="stat-icon">savings</mat-icon>
                  <div class="stat-info">
                    <div class="stat-label">Available Cash</div>
                    <div class="stat-value">{{ portfolio.remainingCash | currency:'INR':'symbol':'1.2-2' }}</div>
                  </div>
                </div>
                <div class="stat-card-mobile">
                  <mat-icon class="stat-icon">people</mat-icon>
                  <div class="stat-info">
                    <div class="stat-label">Investors</div>
                    <div class="stat-value">{{ portfolio.totalInvestors }}</div>
                  </div>
                </div>
                <div class="stat-card-mobile">
                  <mat-icon class="stat-icon">pie_chart</mat-icon>
                  <div class="stat-info">
                    <div class="stat-label">Holdings Value</div>
                    <div class="stat-value">{{ portfolio.totalHoldingsValue | currency:'INR':'symbol':'1.0-0' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </mat-expansion-panel>
        } @else {
          <!-- Desktop Stats Card -->
          <mat-card class="portfolio-header-card">
            <mat-card-content>
              <div class="portfolio-stats">
                <div class="stat-item">
                  <div class="stat-label">NAV</div>
                  <div class="stat-value">{{ portfolio.navValue | currency:'INR':'symbol':'1.4-4' }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Total AUM</div>
                  <div class="stat-value">{{ portfolio.totalAum | currency:'INR':'symbol':'1.0-0' }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Total Units</div>
                  <div class="stat-value">{{ portfolio.totalUnits | number:'1.4-4' }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Available Cash</div>
                  <div class="stat-value">{{ portfolio.remainingCash | currency:'INR':'symbol':'1.2-2' }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Investors</div>
                  <div class="stat-value">{{ portfolio.totalInvestors }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Holdings value</div>
                  <div class="stat-value">{{ portfolio.totalHoldingsValue | currency:'INR':'symbol':'1.0-0' }}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }

        <!-- Portfolio Tabs -->
        <mat-card class="portfolio-content-card">
          <mat-tab-group>
            <!-- Investors Tab -->
            <mat-tab label="Investors">
              <div class="tab-content">
                @if (investmentsLoading) {
                  <div class="loading-container">
                    <mat-spinner diameter="40"></mat-spinner>
                    <p>Loading investors...</p>
                  </div>
                } @else if (portfolioInvestments.length > 0) {
                  <div class="investors-section">
                    <div class="section-header">
                      <h3>Portfolio Investors ({{ portfolioInvestments.length }})</h3>
                      @if (isAdmin && !isMobile) {
                        <button mat-raised-button color="primary" (click)="openAddUserDialog()">
                          <mat-icon>person_add</mat-icon>
                          Add User
                        </button>
                      }
                    </div>

                    @if (isMobile) {
                      <!-- Mobile Investor Cards -->
                      <div class="investors-mobile">
                        @for (investment of portfolioInvestments; track investment.id) {
                          <mat-card class="investor-card-mobile" [class.expanded]="expandedInvestor === investment.id">
                            <mat-card-header (click)="toggleInvestor(investment.id)">
                              <div class="investor-header-content">
                                <div class="investor-info">
                                  <h4>{{ investment.user.username }}</h4>
                                  <span class="investor-id">ID: {{ investment.user.id }}</span>
                                </div>
                                <div class="investor-summary">
                                  <div class="current-value">{{ investment.currentValue | currency:'INR':'symbol':'1.0-0' }}</div>
                                  <div class="returns" 
                                       [class.positive]="investment.totalReturns >= 0"
                                       [class.negative]="investment.totalReturns < 0">
                                    {{ investment.totalReturns >= 0 ? '+' : '' }}{{ investment.returnPercentage | number:'1.1-1' }}%
                                  </div>
                                </div>
                                <div class="header-actions">
                                  <mat-chip class="aum-chip">{{ investment.aumPercentage | number:'1.1-1' }}%</mat-chip>
                                  <button mat-icon-button [matMenuTriggerFor]="mobileInvestmentMenu" (click)="$event.stopPropagation()">
                                    <mat-icon>more_vert</mat-icon>
                                  </button>
                                  <mat-menu #mobileInvestmentMenu="matMenu">
                                    <button mat-menu-item (click)="viewInvestmentDetails(investment)">
                                      <mat-icon>visibility</mat-icon>
                                      <span>View Details</span>
                                    </button>
                                    @if (isAdmin) {
                                      <button mat-menu-item (click)="openInvestMoreDialog(investment)">
                                        <mat-icon>add_circle</mat-icon>
                                        <span>Invest More</span>
                                      </button>
                                      <button mat-menu-item (click)="openWithdrawDialog(investment)">
                                        <mat-icon>remove_circle</mat-icon>
                                        <span>Withdraw</span>
                                      </button>
                                    }
                                  </mat-menu>
                                </div>
                              </div>
                              <mat-icon class="expand-icon" [class.rotated]="expandedInvestor === investment.id">expand_more</mat-icon>
                            </mat-card-header>
                            
                            <mat-card-content class="expandable-content" [class.expanded]="expandedInvestor === investment.id">
                              <div class="investment-details-mobile">
                                <div class="detail-row">
                                  <div class="detail-item">
                                    <mat-icon class="detail-icon">account_balance</mat-icon>
                                    <div class="detail-info">
                                      <span class="detail-label">Total Invested</span>
                                      <span class="detail-value">{{ investment.totalInvested | currency:'INR':'symbol':'1.2-2' }}</span>
                                    </div>
                                  </div>
                                  <div class="detail-item">
                                    <mat-icon class="detail-icon">trending_up</mat-icon>
                                    <div class="detail-info">
                                      <span class="detail-label">Units Held</span>
                                      <span class="detail-value">{{ investment.unitsHeld | number:'1.4-4' }}</span>
                                    </div>
                                  </div>
                                </div>
                                <div class="detail-row">
                                  <div class="detail-item">
                                    <mat-icon class="detail-icon">analytics</mat-icon>
                                    <div class="detail-info">
                                      <span class="detail-label">Average NAV</span>
                                      <span class="detail-value">{{ investment.averageNav | currency:'INR':'symbol':'1.4-4' }}</span>
                                    </div>
                                  </div>
                                  <div class="detail-item">
                                    <mat-icon class="detail-icon">receipt</mat-icon>
                                    <div class="detail-info">
                                      <span class="detail-label">Fees Paid</span>
                                      <span class="detail-value">{{ investment.totalChargesPaid | currency:'INR':'symbol':'1.2-2' }}</span>
                                    </div>
                                  </div>
                                </div>
                                <div class="detail-row">
                                  <div class="detail-item full-width">
                                    <mat-icon class="detail-icon" [class.positive]="investment.totalReturns >= 0" [class.negative]="investment.totalReturns < 0">
                                      {{ investment.totalReturns >= 0 ? 'trending_up' : 'trending_down' }}
                                    </mat-icon>
                                    <div class="detail-info">
                                      <span class="detail-label">Total Returns</span>
                                      <span class="detail-value" 
                                            [class.positive]="investment.totalReturns >= 0"
                                            [class.negative]="investment.totalReturns < 0">
                                        {{ investment.totalReturns >= 0 ? '+' : '' }}{{ investment.totalReturns | currency:'INR':'symbol':'1.2-2' }}
                                        ({{ investment.returnPercentage | number:'1.2-2' }}%)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </mat-card-content>
                          </mat-card>
                        }
                      </div>
                    } @else {
                      <!-- Desktop Table -->
                      <div class="table-container">
                        <table mat-table [dataSource]="portfolioInvestments" class="investors-table">

                          <!-- User Column -->
                          <ng-container matColumnDef="user">
                            <th mat-header-cell *matHeaderCellDef>Investor</th>
                            <td mat-cell *matCellDef="let investment">
                              <div class="user-info">
                                <div class="user-name">{{ investment.user.username }}</div>
                                <div class="user-id">ID: {{ investment.user.id }}</div>
                              </div>
                            </td>
                          </ng-container>

                          <!-- Investment Column -->
                          <ng-container matColumnDef="investment">
                            <th mat-header-cell *matHeaderCellDef>Investment</th>
                            <td mat-cell *matCellDef="let investment">
                              <div class="investment-info">
                                <div class="amount">{{ investment.totalInvested | currency:'INR':'symbol':'1.2-2' }}</div>
                                <div class="units">{{ investment.unitsHeld | number:'1.4-4' }} units</div>
                                <div class="avg-nav">Avg NAV: {{ investment.averageNav | currency:'INR':'symbol':'1.4-4' }}</div>
                              </div>
                            </td>
                          </ng-container>

                          <!-- Current Value Column -->
                          <ng-container matColumnDef="currentValue">
                            <th mat-header-cell *matHeaderCellDef>Current Value</th>
                            <td mat-cell *matCellDef="let investment">
                              <div class="value-info">
                                <div class="current-value">{{ investment.currentValue | currency:'INR':'symbol':'1.2-2' }}</div>
                                <div class="returns"
                                     [class.positive]="investment.totalReturns >= 0"
                                     [class.negative]="investment.totalReturns < 0">
                                  {{ investment.totalReturns >= 0 ? '+' : '' }}{{ investment.totalReturns | currency:'INR':'symbol':'1.2-2' }}
                                  ({{ investment.returnPercentage | number:'1.2-2' }}%)
                                </div>
                              </div>
                            </td>
                          </ng-container>

                          <!-- AUM Share Column -->
                          <ng-container matColumnDef="aumShare">
                            <th mat-header-cell *matHeaderCellDef>AUM Share</th>
                            <td mat-cell *matCellDef="let investment">
                              <div class="aum-share">
                                <mat-chip>{{ investment.aumPercentage | number:'1.2-2' }}%</mat-chip>
                              </div>
                            </td>
                          </ng-container>

                          <!-- Fees Column -->
                          <ng-container matColumnDef="fees">
                            <th mat-header-cell *matHeaderCellDef>Fees Paid</th>
                            <td mat-cell *matCellDef="let investment">
                              {{ investment.totalChargesPaid | currency:'INR':'symbol':'1.2-2' }}
                            </td>
                          </ng-container>

                          <!-- Actions Column -->
                          <ng-container matColumnDef="actions">
                            <th mat-header-cell *matHeaderCellDef>Actions</th>
                            <td mat-cell *matCellDef="let investment">
                              <button mat-icon-button [matMenuTriggerFor]="investmentMenu">
                                <mat-icon>more_vert</mat-icon>
                              </button>
                              <mat-menu #investmentMenu="matMenu">
                                <button mat-menu-item (click)="viewInvestmentDetails(investment)">
                                  <mat-icon>visibility</mat-icon>
                                  View Details
                                </button>
                                @if (isAdmin) {
                                  <button mat-menu-item (click)="openInvestMoreDialog(investment)">
                                    <mat-icon>add_circle</mat-icon>
                                    Invest More
                                  </button>
                                  <button mat-menu-item (click)="openWithdrawDialog(investment)">
                                    <mat-icon>remove_circle</mat-icon>
                                    Withdraw
                                  </button>
                                }
                              </mat-menu>
                            </td>
                          </ng-container>

                          <tr mat-header-row *matHeaderRowDef="investorColumns"></tr>
                          <tr mat-row *matRowDef="let row; columns: investorColumns;"></tr>
                        </table>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="no-investors">
                    <mat-icon>people_outline</mat-icon>
                    <h3>No Investors Yet</h3>
                    <p>This portfolio doesn't have any investors. Add users to start building the portfolio.</p>
                    @if (isAdmin) {
                      <button mat-raised-button color="primary" (click)="openAddUserDialog()">
                        Add First Investor
                      </button>
                    }
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Holdings Tab -->
            <mat-tab label="Holdings">
              <div class="tab-content">
                <div class="holdings-section">
                  <div class="section-header">
                    <h3>Portfolio Holdings ({{ portfolio.totalHoldings }})</h3>
                    @if (isAdmin) {
                      <button mat-raised-button color="primary" (click)="manageHoldings()">
                        <mat-icon>pie_chart</mat-icon>
                        Manage Holdings
                      </button>
                    }
                  </div>
                  <div class="holdings-preview">
                    <mat-icon>trending_up</mat-icon>
                    <h4>Holdings Overview</h4>
                    <p>View and manage portfolio holdings, buy/sell stocks, and track performance.</p>
                    <div class="holdings-stats">
                      <div class="stat-card">
                        <div class="stat-label">Total Holdings</div>
                        <div class="stat-value">{{ portfolio.totalHoldings }}</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-label">Holdings Value</div>
                        <div class="stat-value">{{ portfolio.totalHoldingsValue | currency:'INR':'symbol':'1.0-0' }}</div>
                      </div>
                    </div>
                    <button mat-raised-button color="primary" (click)="manageHoldings()">
                      <mat-icon>open_in_new</mat-icon>
                      Open Holdings Manager
                    </button>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Performance Tab -->
            <mat-tab label="Performance">
              <div class="tab-content">
                <div class="performance-section">
                  <div class="section-header">
                    <h3>Portfolio Performance</h3>
                  </div>
                  <div class="nav-chart-container">
                    <app-nav-history-chart
                      [navHistory]="navHistory"
                      [portfolioId]="portfolioId"
                      [isLoading]="navHistoryLoading">
                    </app-nav-history-chart>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
        
        <!-- Floating Action Buttons for Mobile -->
        @if (isMobile && isAdmin) {
          <div class="fab-container">
            <button mat-fab color="primary" class="fab-add-user" (click)="openAddUserDialog()" matTooltip="Add User">
              <mat-icon>person_add</mat-icon>
            </button>
            <button mat-fab color="accent" class="fab-manage-holdings" (click)="manageHoldings()" matTooltip="Manage Holdings">
              <mat-icon>pie_chart</mat-icon>
            </button>
          </div>
        }
      } @else {
        <div class="error-container">
          <mat-icon>error_outline</mat-icon>
          <h3>Portfolio Not Found</h3>
          <p>The requested portfolio could not be found.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Back to Portfolios
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .portfolio-details-container {
      width: 100%;
      padding: 16px;
      padding-top: 0;
      min-height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
    }

    /* Loading and Error States */
    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      flex: 1;
    }

    .loading-container mat-spinner, .error-container mat-icon {
      margin-bottom: 20px;
    }

    .error-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.5;
    }

    /* Mobile Stats Panel */
    .mobile-stats-panel {
      margin-bottom: 16px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .mobile-stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .key-stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-value {
      font-size: 20px;
      font-weight: 600;
      color: #1976d2;
    }

    .aum-value {
      font-size: 14px;
      color: #666;
    }

    .mobile-stats-content {
      padding: 16px 0;
    }

    .stats-grid-mobile {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .stat-card-mobile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .stat-icon {
      color: #1976d2;
      font-size: 20px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-top: 2px;
    }

    /* Desktop Stats */
    .portfolio-header-card {
      margin-bottom: 16px;
      flex-shrink: 0;
    }

    .portfolio-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    /* Mobile Investor Cards */
    .investors-mobile {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .investor-card-mobile {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .investor-card-mobile.expanded {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .investor-card-mobile mat-card-header {
      padding: 16px;
      cursor: pointer;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #dee2e6;
    }

    .investor-header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .investor-info h4 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: #212529;
    }

    .investor-id {
      font-size: 12px;
      color: #6c757d;
    }

    .investor-summary {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .investor-summary .current-value {
      font-size: 16px;
      font-weight: 600;
      color: #212529;
    }

    .investor-summary .returns {
      font-size: 14px;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .aum-chip {
      background: #1976d2 !important;
      color: white !important;
      font-weight: 600;
    }

    .expand-icon {
      transition: transform 0.3s ease;
      color: #6c757d;
    }

    .expand-icon.rotated {
      transform: rotate(180deg);
    }

    /* Expandable Content */
    .expandable-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
      padding: 0;
    }

    .expandable-content.expanded {
      max-height: 500px;
      padding: 16px;
    }

    /* Override Angular Material's default card content padding when collapsed */
    .expandable-content:not(.expanded) {
      padding: 0 !important;
    }

    .expandable-content:not(.expanded).mat-mdc-card-content {
      padding-bottom: 0 !important;
    }

    .investment-details-mobile {
      margin-bottom: 16px;
    }

    .detail-row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .detail-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .detail-item.full-width {
      flex: 1;
    }

    .detail-icon {
      color: #1976d2;
      font-size: 20px;
    }

    .detail-icon.positive {
      color: #4caf50;
    }

    .detail-icon.negative {
      color: #f44336;
    }

    .detail-info {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: 12px;
      color: #6c757d;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 16px;
      font-weight: 600;
      color: #212529;
      margin-top: 2px;
    }

    .detail-value.positive {
      color: #4caf50;
    }

    .detail-value.negative {
      color: #f44336;
    }

    .returns.positive {
      color: #4caf50;
    }

    .returns.negative {
      color: #f44336;
    }

    /* Floating Action Buttons */
    .fab-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      z-index: 1000;
    }

    .fab-add-user {
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
    }

    .fab-manage-holdings {
      box-shadow: 0 4px 12px rgba(255, 64, 129, 0.4);
    }

    /* Desktop Content */
    .portfolio-content-card {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .portfolio-content-card .mat-mdc-tab-group {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .portfolio-content-card .mat-mdc-tab-body-wrapper {
      flex: 1;
      display: flex;
    }

    .portfolio-content-card .mat-mdc-tab-body {
      flex: 1;
    }

    .portfolio-content-card .mat-mdc-tab-body-content {
      height: 100%;
    }

    /* Ensure Angular Material tab components work with flexbox */
    ::ng-deep .portfolio-content-card .mat-mdc-tab-group {
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }

    ::ng-deep .portfolio-content-card .mat-mdc-tab-body-wrapper {
      flex: 1 !important;
      display: flex !important;
    }

    ::ng-deep .portfolio-content-card .mat-mdc-tab-body {
      flex: 1 !important;
    }

    ::ng-deep .portfolio-content-card .mat-mdc-tab-body-content {
      height: 100% !important;
      overflow: auto !important;
    }

    .tab-content {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .investors-section, .holdings-section {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-shrink: 0;
    }

    .section-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .table-container {
      overflow-x: auto;
      flex: 1;
      min-height: 0;
    }

    .investors-table {
      width: 100%;
      min-width: 800px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      font-size: 14px;
    }

    .user-id {
      font-size: 12px;
      color: #666;
    }

    .investment-info {
      display: flex;
      flex-direction: column;
    }

    .amount {
      font-weight: 500;
      font-size: 14px;
    }

    .units, .avg-nav {
      font-size: 12px;
      color: #666;
    }

    .value-info {
      display: flex;
      flex-direction: column;
    }

    .current-value {
      font-weight: 500;
      font-size: 14px;
    }

    .returns {
      font-size: 12px;
    }

    .aum-share {
      display: flex;
      justify-content: center;
    }

    .holdings-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 20px;
      text-align: center;
      background: #f9f9f9;
      border-radius: 8px;
      margin-top: 16px;
      flex: 1;
    }

    .holdings-preview mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #1976d2;
    }

    .holdings-preview h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
    }

    .holdings-preview p {
      margin: 0 0 20px 0;
      color: #666;
      max-width: 400px;
    }

    .holdings-stats {
      display: flex;
      gap: 20px;
      margin: 20px 0;
    }

    .stat-card {
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      min-width: 120px;
    }

    .stat-card .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .stat-card .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .no-investors {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: #666;
      flex: 1;
    }

    .no-investors mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-investors h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
    }

    .no-investors p {
      margin: 0 0 24px 0;
      opacity: 0.7;
    }

    .performance-section {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .nav-chart-container {
      flex: 1;
      min-height: 400px;
      margin-top: 16px;
    }

    /* Mobile Toolbar Styles */
    .mobile-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .mobile-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #212529;
      flex: 1;
    }

    .mobile-menu-trigger {
      background: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .mobile-actions-menu {
      margin-top: 8px;
    }

    .mobile-actions-menu .mat-mdc-menu-item {
      min-height: 48px;
      padding: 0 16px;
    }

    .mobile-actions-menu .mat-mdc-menu-item mat-icon {
      margin-right: 16px;
      color: #1976d2;
    }

    .mobile-actions-menu .mat-mdc-menu-item:hover {
      background-color: rgba(25, 118, 210, 0.08);
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .portfolio-details-container {
        padding: 12px;
      }

      .stats-grid-mobile {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .detail-row {
        flex-direction: column;
        gap: 8px;
      }

      .investor-card-mobile mat-card-header {
        padding: 12px;
      }

      .expandable-content.expanded {
        padding: 12px;
      }

      .fab-container {
        bottom: 16px;
        right: 16px;
        gap: 12px;
      }
    }

    @media (max-width: 768px) {
      .mobile-toolbar {
        padding: 12px;
        margin-bottom: 12px;
      }

      .mobile-title {
        font-size: 18px;
      }
    }

    @media (min-width: 769px) {
      .portfolio-details-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }

      .mobile-toolbar {
        display: none; /* Hide mobile toolbar on desktop */
      }
    }
  `]
})
export class PortfolioDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private portfolioService = inject(PortfolioService);
  private investmentService = inject(InvestmentService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private toolbar = inject(ToolbarService);
  private breakpointObserver = inject(BreakpointObserver);
  private dashboardService = inject(DashboardService);
  private destroy$ = new Subject<void>();

  portfolioId!: number;
  portfolio: Portfolio | null = null;
  portfolioInvestments: Investment[] = [];
  isLoading = true;
  investmentsLoading = true;
  isAdmin = false;
  isMobile = false;
  expandedInvestor: number | null = null;
  statsExpanded = false;
  investorColumns = ['user', 'investment', 'currentValue', 'aumShare', 'fees', 'actions'];
  navHistory: NavHistoryItem[] = [];
  navHistoryLoading = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.portfolioId = Number(this.route.snapshot.paramMap.get('id'));

    // Setup mobile detection and responsive toolbar
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        this.setupResponsiveToolbar();
      });

    if (this.portfolioId) {
      this.loadPortfolioDetails();
      this.loadPortfolioInvestments();
      this.loadNavHistory();
      // Setup responsive toolbar
      this.setupResponsiveToolbar();
    } else {
      this.router.navigate(['/portfolios']);
    }
  }

  toggleInvestor(investmentId: number): void {
    this.expandedInvestor = this.expandedInvestor === investmentId ? null : investmentId;
  }

  toggleStats(): void {
    this.statsExpanded = !this.statsExpanded;
  }

  ngOnDestroy(): void {
    this.toolbar.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPortfolioDetails(): void {
    this.isLoading = true;
    this.portfolioService.getPortfolioDetails(this.portfolioId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const p = response.data as Portfolio;
          this.portfolio = p;
          // Set toolbar title to include name and date
          const createdBy = p.createdBy?.username || 'Unknown';
          const dateStr = p.createdAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(p.createdAt)) : '';
          const title = dateStr ? `${p.name} • ${createdBy} • ${dateStr}` : `${p.name} • ${createdBy}`;
          this.toolbar.setTitle(title);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load portfolio details:', error);
        this.snackBar.open('Failed to load portfolio details', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  loadPortfolioInvestments(): void {
    this.investmentsLoading = true;
    this.investmentService.getPortfolioInvestments(this.portfolioId).subscribe({
      next: (response) => {
        if (response.success) {
          this.portfolioInvestments = response.data || [];
        }
        this.investmentsLoading = false;
      },
      error: (error) => {
        console.error('Failed to load portfolio investments:', error);
        this.snackBar.open('Failed to load portfolio investments', 'Close', { duration: 5000 });
        this.investmentsLoading = false;
      }
    });
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(AddUserToPortfolioDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { portfolioId: this.portfolioId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPortfolioInvestments();
        this.loadPortfolioDetails(); // Refresh portfolio data
        this.snackBar.open('User added to portfolio successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openInvestMoreDialog(investment: Investment): void {
    const dialogRef = this.dialog.open(InvestMoreDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: {
        portfolioId: this.portfolioId,
        investment: investment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPortfolioInvestments();
        this.loadPortfolioDetails();
        // Success message is handled by the dialog component
      }
    });
  }

  openWithdrawDialog(investment: Investment): void {
    const dialogRef = this.dialog.open(WithdrawUserDialogComponent, {
      width: '600px',
      data: {
        portfolioId: this.portfolioId,
        investment: investment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPortfolioInvestments();
        this.loadPortfolioDetails();
        this.snackBar.open('User withdrawal processed successfully', 'Close', { duration: 3000 });
      }
    });
  }

  viewInvestmentDetails(investment: Investment): void {
    this.snackBar.open(`Investment details for ${investment.user.username} coming soon!`, 'Close', { duration: 3000 });
  }

  manageFees(): void {
    this.router.navigate(['/portfolios', this.portfolioId, 'fees']);
  }

  manageHoldings(): void {
    this.router.navigate(['/holdings'], { queryParams: { portfolioId: this.portfolioId } });
  }

  viewTransactions(): void {
    this.router.navigate(['/transactions/portfolio', this.portfolioId]);
  }

  goBack(): void {
    this.router.navigate(['/portfolios']);
  }

  setupResponsiveToolbar(): void {
    // Desktop: Show toolbar in header, Mobile: Hide from header (show inline)
    if (!this.isMobile) {
      this.toolbar.setControls(PortfolioDetailsToolbarControlsComponent);
    } else {
      this.toolbar.setControls(null);
    }
  }

  manageCharges(): void {
    this.router.navigate(['/transaction-charges', this.portfolioId]);
  }

  loadNavHistory(): void {
    this.navHistoryLoading = true;
    // Load 1 year of NAV history by default
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    this.dashboardService.getNavHistory(
      this.portfolioId,
      startDateStr,
      endDateStr
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.navHistory = response.data || [];
          }
          this.navHistoryLoading = false;
        },
        error: (error) => {
          console.error('Failed to load NAV history:', error);
          this.navHistory = [];
          this.navHistoryLoading = false;
        }
      });
  }
}
