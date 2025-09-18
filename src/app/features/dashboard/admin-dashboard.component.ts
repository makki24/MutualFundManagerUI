import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

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
                        <span class="transaction-type" [class]="transaction.type.toLowerCase()">
                          {{ transaction.type }}
                        </span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Amount</th>
                      <td mat-cell *matCellDef="let transaction">
                        {{ transaction.amount | currency:'INR':'symbol':'1.2-2' }}
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="transactionColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: transactionColumns;"></tr>
                  </table>
                </div>
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

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      transition: transform 0.2s ease-in-out;
    }

    .summary-card:hover {
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .card-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      padding: 12px;
      border-radius: 50%;
    }

    .card-icon.portfolios {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    .card-icon.users {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .card-icon.aum {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .card-icon.transactions {
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    .card-info h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .card-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
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

    .transactions-table {
      width: 100%;
    }

    .transaction-type {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .transaction-type.investment {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .transaction-type.withdrawal {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .transaction-type.fee {
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .quick-actions button {
      height: 48px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  dashboardData: AdminDashboard | null = null;
  isLoading = true;
  transactionColumns = ['date', 'user', 'type', 'amount'];

  ngOnInit(): void {
    this.loadDashboard();
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
