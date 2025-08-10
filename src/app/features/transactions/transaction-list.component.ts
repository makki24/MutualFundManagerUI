import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { TransactionService } from '../../core/services/transaction.service';
import { PortfolioService } from '../../core/services/portfolio.service';
import { AuthService } from '../../core/services/auth.service';
import { Transaction, TransactionFilter } from '../../core/models/transaction.model';
import { Portfolio } from '../../core/models/portfolio.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule
  ],
  template: `
    <div class="transactions-container">
      <div class="page-header">
        <h1>Transaction History</h1>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <div class="filter-row">
              @if (isAdmin) {
                <mat-form-field appearance="outline">
                  <mat-label>Portfolio</mat-label>
                  <mat-select formControlName="portfolioId">
                    <mat-option [value]="null">All Portfolios</mat-option>
                    @for (portfolio of portfolios; track portfolio.id) {
                      <mat-option [value]="portfolio.id">{{ portfolio.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }

              <mat-form-field appearance="outline">
                <mat-label>Transaction Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option [value]="null">All Types</mat-option>
                  <mat-option value="INVESTMENT">Investment</mat-option>
                  <mat-option value="WITHDRAWAL">Withdrawal</mat-option>
                  <mat-option value="FEE">Fee</mat-option>
                  <mat-option value="BUY">Buy</mat-option>
                  <mat-option value="SELL">Sell</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="filter-actions">
              <button mat-raised-button color="primary" (click)="applyFilters()">
                <mat-icon>search</mat-icon>
                Apply Filters
              </button>
              <button mat-button (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Clear
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      @if (isLoading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading transactions...</p>
        </div>
      } @else if (transactions.length > 0) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>Transactions ({{ transactions.length }})</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="transactions" class="transactions-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let transaction">
                    {{ transaction.createdAt | date:'short' }}
                  </td>
                </ng-container>

                @if (isAdmin) {
                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef>User</th>
                    <td mat-cell *matCellDef="let transaction">
                      <div class="user-info">
                        <div class="user-name">{{ transaction.user?.firstName }} {{ transaction.user?.lastName }}</div>
                        <div class="user-username">@{{ transaction.user?.username }}</div>
                      </div>
                    </td>
                  </ng-container>
                }

                <ng-container matColumnDef="portfolio">
                  <th mat-header-cell *matHeaderCellDef>Portfolio</th>
                  <td mat-cell *matCellDef="let transaction">
                    {{ transaction.portfolio?.name || 'Portfolio #' + transaction.portfolioId }}
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
                    <span [class.negative]="transaction.type === 'WITHDRAWAL' || transaction.type === 'FEE'">
                      {{ transaction.amount | currency:'USD':'symbol':'1.2-2' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="units">
                  <th mat-header-cell *matHeaderCellDef>Units</th>
                  <td mat-cell *matCellDef="let transaction">
                    @if (transaction.units) {
                      {{ transaction.units | number:'1.4-4' }}
                    } @else {
                      -
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="nav">
                  <th mat-header-cell *matHeaderCellDef>NAV</th>
                  <td mat-cell *matCellDef="let transaction">
                    @if (transaction.navValue) {
                      {{ transaction.navValue | currency:'USD':'symbol':'1.4-4' }}
                    } @else {
                      -
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let transaction">
                    {{ transaction.description }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="no-data">
          <mat-icon>receipt_long</mat-icon>
          <h3>No Transactions Found</h3>
          <p>No transactions match your current filters.</p>
          <button mat-button (click)="clearFilters()">Clear Filters</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .transactions-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
      color: #333;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
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

    .table-container {
      overflow-x: auto;
    }

    .transactions-table {
      width: 100%;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      font-size: 14px;
    }

    .user-username {
      font-size: 12px;
      color: #666;
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

    .transaction-type.buy {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .transaction-type.sell {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    .negative {
      color: #f44336;
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

    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }

      .filter-actions {
        justify-content: stretch;
      }

      .filter-actions button {
        flex: 1;
      }
    }
  `]
})
export class TransactionListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private portfolioService = inject(PortfolioService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  transactions: Transaction[] = [];
  portfolios: Portfolio[] = [];
  filterForm: FormGroup;
  isLoading = true;
  isAdmin = false;
  displayedColumns: string[] = [];

  constructor() {
    this.isAdmin = this.authService.isAdmin();
    this.displayedColumns = this.isAdmin
      ? ['date', 'user', 'portfolio', 'type', 'amount', 'units', 'nav', 'description']
      : ['date', 'portfolio', 'type', 'amount', 'units', 'nav', 'description'];

    this.filterForm = this.fb.group({
      portfolioId: [null],
      type: [null],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit(): void {
    if (this.isAdmin) {
      this.loadPortfolios();
    }
    this.loadTransactions();
  }

  loadPortfolios(): void {
    this.portfolioService.getPortfolios().subscribe({
      next: (response) => {
        if (response.success) {
          this.portfolios = response.data || [];
        }
      },
      error: (error) => {
        console.error('Failed to load portfolios:', error);
      }
    });
  }

  loadTransactions(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.isLoading = false;
      return;
    }

    const filter = this.buildFilter();

    if (this.isAdmin) {
      // For admin, load all transactions or portfolio-specific transactions
      if (filter.portfolioId) {
        this.transactionService.getPortfolioTransactions(filter.portfolioId, filter).subscribe({
          next: (response) => {
            this.transactions = response.transactions;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Failed to load transactions:', error);
            this.snackBar.open('Failed to load transactions', 'Close', { duration: 5000 });
            this.isLoading = false;
          }
        });
      } else {
        // Load all transactions for admin (this would need a new API endpoint)
        this.transactionService.getUserTransactions(currentUser.id, filter).subscribe({
          next: (response) => {
            this.transactions = response.transactions;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Failed to load transactions:', error);
            this.snackBar.open('Failed to load transactions', 'Close', { duration: 5000 });
            this.isLoading = false;
          }
        });
      }
    } else {
      // For regular users, load their transactions
      this.transactionService.getUserTransactions(currentUser.id, filter).subscribe({
        next: (response) => {
          this.transactions = response.transactions;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load transactions:', error);
          this.snackBar.open('Failed to load transactions', 'Close', { duration: 5000 });
          this.isLoading = false;
        }
      });
    }
  }

  buildFilter(): TransactionFilter {
    const formValue = this.filterForm.value;
    const filter: TransactionFilter = {};

    if (formValue.portfolioId) {
      filter.portfolioId = formValue.portfolioId;
    }
    if (formValue.type) {
      filter.type = formValue.type;
    }
    if (formValue.startDate) {
      filter.startDate = formValue.startDate.toISOString().split('T')[0];
    }
    if (formValue.endDate) {
      filter.endDate = formValue.endDate.toISOString().split('T')[0];
    }

    return filter;
  }

  applyFilters(): void {
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadTransactions();
  }
}
