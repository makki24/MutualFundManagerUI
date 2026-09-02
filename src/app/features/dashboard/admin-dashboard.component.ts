import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { DashboardService } from '../../core/services/dashboard.service';
import { AdminDashboard } from '../../core/models/dashboard.model';
import { PortfolioFormDialogComponent } from '../portfolios/portfolio-form-dialog.component';
import { UserFormDialogComponent } from '../users/user-form-dialog.component';

@Component({
  selector: 'app-admin-dashboard',
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
          <p>Loading dashboard...</p>
        </div>
      } @else if (dashboardData) {
        <!-- Summary Cards -->
        <div class="summary-cards">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-header">
                <mat-icon class="card-icon portfolios">pie_chart</mat-icon>
                <div class="card-info">
                  <h3>{{ dashboardData.totalPortfolios }}</h3>
                  <p>Total Portfolios</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-header">
                <mat-icon class="card-icon users">people</mat-icon>
                <div class="card-info">
                  <h3>{{ dashboardData.totalUsers }}</h3>
                  <p>Total Users</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-header">
                <mat-icon class="card-icon aum">account_balance</mat-icon>
                <div class="card-info">
                  <h3>{{ dashboardData.totalAum | currency:'INR':'symbol':'1.0-0' }}</h3>
                  <p>Total AUM</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-header">
                <mat-icon class="card-icon transactions">receipt_long</mat-icon>
                <div class="card-info">
                  <h3>{{ dashboardData.totalTransactions }}</h3>
                  <p>Total Transactions</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Recent Transactions -->
        <div class="dashboard-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Recent Transactions</mat-card-title>
              <div class="card-actions">
                <button mat-button routerLink="/transactions">View All</button>
              </div>
            </mat-card-header>
            <mat-card-content>
              @if (dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0) {
                @if (isMobile) {
                  <!-- Mobile Card View -->
                  <div class="transaction-cards-mobile">
                    @for (transaction of dashboardData.recentTransactions; track $index) {
                      <div class="transaction-card-mobile">
                        <div class="txn-card-header">
                          <div class="txn-user">
                            <span class="txn-name">{{ transaction.user?.firstName }} {{ transaction.user?.lastName }}</span>
                            <span class="txn-date">{{ transaction.createdAt | date:'MMM d, h:mm a' }}</span>
                          </div>
                          <div class="txn-amount">{{ (transaction.totalAmount || transaction.netAmount) | currency:'INR':'symbol':'1.0-0' }}</div>
                        </div>
                        <div class="txn-card-footer">
                          <mat-chip class="txn-type-chip" [class]="transaction.transactionType?.toLowerCase()">
                            {{ transaction.transactionType }}
                          </mat-chip>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <!-- Desktop Table View -->
                  <div class="table-container">
                    <table mat-table [dataSource]="dashboardData.recentTransactions" class="transactions-table">
                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>Date</th>
                        <td mat-cell *matCellDef="let transaction">
                          {{ transaction.createdAt | date:'short' }}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="user">
                        <th mat-header-cell *matHeaderCellDef>User</th>
                        <td mat-cell *matCellDef="let transaction">
                          {{ transaction.user?.firstName }} {{ transaction.user?.lastName }}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="type">
                        <th mat-header-cell *matHeaderCellDef>Type</th>
                        <td mat-cell *matCellDef="let transaction">
                          <span class="transaction-type" [class]="transaction.transactionType?.toLowerCase()">
                            {{ transaction.transactionType }}
                          </span>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef>Amount</th>
                        <td mat-cell *matCellDef="let transaction">
                          {{ (transaction.totalAmount || transaction.netAmount) | currency:'INR':'symbol':'1.2-2' }}
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="transactionColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: transactionColumns;"></tr>
                    </table>
                  </div>
                }
              } @else {
                <div class="no-data">
                  <mat-icon>receipt_long</mat-icon>
                  <p>No recent transactions</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <div class="dashboard-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="quick-actions">
                <button mat-raised-button color="primary" (click)="createPortfolio()">
                  <mat-icon>add</mat-icon>
                  Create Portfolio
                </button>
                <button mat-raised-button color="accent" (click)="addUser()">
                  <mat-icon>person_add</mat-icon>
                  Add User
                </button>
                <button mat-raised-button routerLink="/holdings">
                  <mat-icon>trending_up</mat-icon>
                  Manage Holdings
                </button>
                <button mat-raised-button routerLink="/transactions">
                  <mat-icon>analytics</mat-icon>
                  View Reports
                </button>
              </div>
            </mat-card-content>
          </mat-card>
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

    .loading-container p, .error-container p {
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

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .summary-card {
      transition: transform var(--transition-base), box-shadow var(--transition-base);
      cursor: default;
      overflow: hidden;
    }

    .summary-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg) !important;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .card-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      padding: 14px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-icon.portfolios {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%);
      color: #8b5cf6;
    }

    .card-icon.users {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.1) 100%);
      color: #3b82f6;
    }

    .card-icon.aum {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.1) 100%);
      color: #10b981;
    }

    .card-icon.transactions {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.1) 100%);
      color: #f59e0b;
    }

    .card-info h3 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .card-info p {
      margin: 4px 0 0 0;
      color: var(--text-secondary);
      font-size: 13px;
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

    .transactions-table {
      width: 100%;
    }

    .transactions-table tr.mat-mdc-row:nth-child(even) {
      background: rgba(0, 0, 0, 0.015);
    }

    .transactions-table tr.mat-mdc-row:hover {
      background: var(--color-primary-50);
    }

    .transactions-table th {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
    }

    .transactions-table td {
      font-size: 14px;
      color: var(--text-primary);
    }

    .transaction-type {
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .transaction-type.investment {
      background: var(--color-success-light);
      color: #059669;
    }

    .transaction-type.withdrawal {
      background: var(--color-danger-light);
      color: #dc2626;
    }

    .transaction-type.fee {
      background: var(--color-warning-light);
      color: #d97706;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: var(--text-secondary);
    }

    .no-data mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      margin-bottom: 16px;
      opacity: 0.3;
      color: var(--text-tertiary);
    }

    .no-data p {
      font-size: 15px;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .quick-actions button {
      height: 52px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-radius: var(--radius-md) !important;
      font-weight: 500;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }

    .quick-actions button:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .card-info h3 {
        font-size: 20px;
      }

      .quick-actions {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }
    }

    /* Mobile Transaction Cards */
    .transaction-cards-mobile {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .transaction-card-mobile {
      padding: 14px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--surface-border);
      background: var(--surface-bg);
      transition: all var(--transition-fast);
    }

    .txn-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .txn-user {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .txn-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .txn-date {
      font-size: 12px;
      color: var(--text-tertiary);
    }

    .txn-amount {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .txn-card-footer {
      display: flex;
      align-items: center;
    }

    .txn-type-chip {
      font-size: 10px;
      height: 22px;
      padding: 0 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .txn-type-chip.investment {
      background: var(--color-success-light) !important;
      color: #059669 !important;
    }

    .txn-type-chip.withdrawal {
      background: var(--color-danger-light) !important;
      color: #dc2626 !important;
    }

    .txn-type-chip.fee {
      background: var(--color-warning-light) !important;
      color: #d97706 !important;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private breakpointObserver = inject(BreakpointObserver);

  dashboardData: AdminDashboard | null = null;
  isLoading = true;
  isMobile = false;
  transactionColumns = ['date', 'user', 'type', 'amount'];

  ngOnInit(): void {
    this.loadDashboard();
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load admin dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  createPortfolio(): void {
    const dialogRef = this.dialog.open(PortfolioFormDialogComponent, {
      width: '800px',
      data: { mode: 'create' },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboard(); // Refresh dashboard data
      }
    });
  }

  addUser(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboard(); // Refresh dashboard data
      }
    });
  }
}
