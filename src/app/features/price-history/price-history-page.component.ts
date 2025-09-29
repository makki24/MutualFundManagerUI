import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { PriceUpdateLogService, PriceUpdateLog, PriceUpdateLogPage, DashboardStats } from '../../core/services/price-update-log.service';
import { PortfolioService } from '../../core/services/portfolio.service';
import { Portfolio } from '../../core/models/portfolio.model';
import { ToolbarService } from '../../layout/toolbar/toolbar.service';
import { PriceHistoryToolbarControlsComponent } from './price-history-toolbar-controls/price-history-toolbar-controls.component';

@Component({
  selector: 'app-price-history-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  template: `
    <div class="price-history-container">
      <!-- Mobile Toolbar Controls -->
      @if (isMobile) {
        <mat-card class="mobile-toolbar-card">
          <mat-card-content>
            <div class="mobile-toolbar-content">
              <div class="mobile-toolbar-row">
                <mat-form-field appearance="outline" class="mobile-field">
                  <mat-label>Portfolio</mat-label>
                  <mat-select [formControl]="portfolioFilter">
                    <mat-option [value]="null">All Portfolios</mat-option>
                    @for (portfolio of portfolios; track portfolio.id) {
                      <mat-option [value]="portfolio.id">{{ portfolio.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <button mat-raised-button color="primary" (click)="applyFilters()" [disabled]="loading" class="mobile-action-btn">
                  <mat-icon>search</mat-icon>
                  Apply
                </button>
              </div>

              <div class="mobile-toolbar-row">
                <mat-form-field appearance="outline" class="mobile-field date-field">
                  <mat-label>Start Date</mat-label>
                  <input matInput [matDatepicker]="mobileStartPicker" [formControl]="startDateFilter">
                  <mat-datepicker-toggle matIconSuffix [for]="mobileStartPicker"></mat-datepicker-toggle>
                  <mat-datepicker #mobileStartPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="mobile-field date-field">
                  <mat-label>End Date</mat-label>
                  <input matInput [matDatepicker]="mobileEndPicker" [formControl]="endDateFilter">
                  <mat-datepicker-toggle matIconSuffix [for]="mobileEndPicker"></mat-datepicker-toggle>
                  <mat-datepicker #mobileEndPicker></mat-datepicker>
                </mat-form-field>
              </div>

              <div class="mobile-toolbar-actions">
                <button mat-stroked-button (click)="clearFilters()" class="mobile-action-btn">
                  <mat-icon>clear</mat-icon>
                  Clear
                </button>
                <button mat-stroked-button (click)="exportData()" [disabled]="logs.length === 0" class="mobile-action-btn">
                  <mat-icon>download</mat-icon>
                  Export
                </button>
                <button mat-stroked-button (click)="loadLogs()" [disabled]="loading" class="mobile-action-btn">
                  <mat-icon>refresh</mat-icon>
                  Refresh
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Filters -->
      <mat-card class="filters-card" [class.desktop-only]="isMobile">
        <mat-card-content>
          <div class="filters-grid">
            <mat-form-field appearance="outline">
              <mat-label>Portfolio</mat-label>
              <mat-select [formControl]="portfolioFilter">
                <mat-option [value]="null">All Portfolios</mat-option>
                @for (portfolio of portfolios; track portfolio.id) {
                  <mat-option [value]="portfolio.id">{{ portfolio.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="statusFilter">
                <mat-option [value]="null">All Statuses</mat-option>
                <mat-option value="SUCCESS">Success</mat-option>
                <mat-option value="FAILED">Failed</mat-option>
                <mat-option value="SKIPPED">Skipped</mat-option>
                <mat-option value="PRICE_CHANGE_REJECTED">Price Change Rejected</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Update Type</mat-label>
              <mat-select [formControl]="updateTypeFilter">
                <mat-option [value]="null">All Types</mat-option>
                <mat-option value="SCHEDULED_DAILY">Scheduled Daily</mat-option>
                <mat-option value="MANUAL_SINGLE">Manual Single</mat-option>
                <mat-option value="MANUAL_BULK">Manual Bulk</mat-option>
                <mat-option value="MANUAL_BY_DATE">Manual By Date</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Search Symbol</mat-label>
              <input matInput [formControl]="symbolSearch" placeholder="Enter symbol...">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" [formControl]="startDateFilter">
              <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" [formControl]="endDateFilter">
              <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="filter-actions">
            <button mat-raised-button color="primary" (click)="applyFilters()" [disabled]="loading">
              <mat-icon>search</mat-icon>
              Apply Filters
            </button>
            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Clear
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Summary Stats -->
      @if (dashboardStats) {
        <mat-card class="stats-card">
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ dashboardStats.last24Hours.total }}</div>
                <div class="stat-label">Last 24 Hours</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ dashboardStats.last7Days.totalUpdates }}</div>
                <div class="stat-label">Last 7 Days</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ dashboardStats.last30Days.successRate | number:'1.1-1' }}%</div>
                <div class="stat-label">Success Rate</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ dashboardStats.last24Hours.failed }}</div>
                <div class="stat-label">Failed (24h)</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Results -->
      <mat-card class="results-card">
        <mat-card-content>
          @if (loading) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading price update logs...</p>
            </div>
          } @else if (logs.length === 0) {
            <div class="no-data">
              <mat-icon>history</mat-icon>
              <h3>No Price Update Logs Found</h3>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          } @else {
            <!-- Desktop Table -->
            @if (!isMobile) {
            <div class="table-container">
              <table mat-table [dataSource]="logs" class="logs-table">
                <ng-container matColumnDef="updateDate">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let log">
                    {{ log.updateDate | date:'short' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="portfolio">
                  <th mat-header-cell *matHeaderCellDef>Portfolio</th>
                  <td mat-cell *matCellDef="let log">
                    {{ log.portfolioName }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="symbol">
                  <th mat-header-cell *matHeaderCellDef>Symbol</th>
                  <td mat-cell *matCellDef="let log">
                    <div class="symbol-info">
                      <div class="symbol">{{ log.symbol }}</div>
                      <div class="company">{{ log.companyName }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="priceChange">
                  <th mat-header-cell *matHeaderCellDef>Price Change</th>
                  <td mat-cell *matCellDef="let log">
                    <div class="price-change">
                      <div class="old-price">{{ log.oldPrice | currency:'INR':'symbol':'1.2-2' }}</div>
                      <mat-icon class="arrow-icon">arrow_forward</mat-icon>
                      <div class="new-price">{{ log.newPrice | currency:'INR':'symbol':'1.2-2' }}</div>
                    </div>
                    @if (log.priceChangePercentage !== null) {
                      <div class="percentage-change"
                           [class.positive]="log.priceChangePercentage >= 0"
                           [class.negative]="log.priceChangePercentage < 0">
                        {{ log.priceChangePercentage | number:'1.2-2' }}%
                      </div>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let log">
                    <mat-chip [class]="getStatusClass(log.updateStatus)">
                      {{ getStatusText(log.updateStatus) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="updateType">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let log">
                    <mat-chip class="type-chip">
                      {{ getUpdateTypeText(log.updateType) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="executionTime">
                  <th mat-header-cell *matHeaderCellDef>Duration</th>
                  <td mat-cell *matCellDef="let log">
                    @if (log.executionTimeMs) {
                      {{ log.executionTimeMs }}ms
                    } @else {
                      —
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                    (click)="showLogDetails(row)"
                    class="clickable-row"></tr>
              </table>
            </div>
            }

            <!-- Mobile Cards -->
            @if (isMobile) {
            <div class="mobile-cards">
              @for (log of logs; track log.id) {
                <mat-card class="log-card mobile-card" (click)="showLogDetails(log)">
                  <mat-card-content>
                    <div class="card-header">
                      <div class="symbol-info">
                        <div class="symbol">{{ log.symbol }}</div>
                        <div class="company">{{ log.companyName }}</div>
                      </div>
                      <mat-chip [class]="getStatusClass(log.updateStatus)">
                        {{ getStatusText(log.updateStatus) }}
                      </mat-chip>
                    </div>

                    <div class="card-content">
                      <div class="price-change">
                        <div class="price-row">
                          <span class="label">Old Price:</span>
                          <span class="value">{{ log.oldPrice | currency:'INR':'symbol':'1.2-2' }}</span>
                        </div>
                        <div class="price-row">
                          <span class="label">New Price:</span>
                          <span class="value">{{ log.newPrice | currency:'INR':'symbol':'1.2-2' }}</span>
                        </div>
                        @if (log.priceChangePercentage !== null) {
                          <div class="price-row">
                            <span class="label">Change:</span>
                            <span class="value percentage-change"
                                  [class.positive]="log.priceChangePercentage >= 0"
                                  [class.negative]="log.priceChangePercentage < 0">
                              {{ log.priceChangePercentage | number:'1.2-2' }}%
                            </span>
                          </div>
                        }
                      </div>

                      <div class="card-footer">
                        <div class="date">{{ log.updateDate | date:'short' }}</div>
                        <mat-chip class="type-chip">{{ getUpdateTypeText(log.updateType) }}</mat-chip>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
            }

            <!-- Pagination -->
            <mat-paginator
              [length]="totalElements"
              [pageSize]="pageSize"
              [pageIndex]="currentPage"
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .price-history-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-button {
      flex-shrink: 0;
    }

    .header-text h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
    }

    .subtitle {
      margin: 4px 0 0 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .stats-card {
      margin-bottom: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 24px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #1976d2;
    }

    .stat-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }

    .results-card {
      margin-bottom: 24px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      gap: 16px;
    }

    .no-data {
      text-align: center;
      padding: 40px;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: rgba(0, 0, 0, 0.3);
      margin-bottom: 16px;
    }

    .table-container {
      overflow-x: auto;
    }

    .logs-table {
      width: 100%;
    }

    .symbol-info .symbol {
      font-weight: 500;
    }

    .symbol-info .company {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .price-change {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .arrow-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: rgba(0, 0, 0, 0.6);
    }

    .percentage-change {
      font-size: 12px;
      font-weight: 500;
    }

    .percentage-change.positive {
      color: #4caf50;
    }

    .percentage-change.negative {
      color: #f44336;
    }

    .clickable-row {
      cursor: pointer;
    }

    .clickable-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    /* Status chips */
    .success-chip {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .failed-chip {
      background-color: #ffebee;
      color: #c62828;
    }

    .skipped-chip {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .rejected-chip {
      background-color: #fce4ec;
      color: #ad1457;
    }

    .type-chip {
      background-color: #e3f2fd;
      color: #1565c0;
      font-size: 11px;
    }

    /* Mobile styles */
    .mobile-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .mobile-card {
      cursor: pointer;
      transition: box-shadow 0.2s;
    }

    .mobile-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .card-content .price-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .card-content .label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .card-content .value {
      font-weight: 500;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .card-footer .date {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    /* Mobile Toolbar Styles */
    .mobile-toolbar-card {
      margin-bottom: 16px;
    }

    .mobile-toolbar-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .mobile-toolbar-row {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .mobile-field {
      flex: 1;
    }

    .date-field {
      min-width: 140px;
    }

    .mobile-action-btn {
      height: 40px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .mobile-toolbar-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .mobile-toolbar-actions .mobile-action-btn {
      flex: 1;
      min-width: 80px;
    }

    .desktop-only {
      display: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .price-history-container {
        padding: 16px;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .mobile-toolbar-row {
        flex-direction: column;
        gap: 12px;
      }

      .mobile-field {
        width: 100%;
      }

      .date-field {
        min-width: unset;
      }

      .mobile-action-btn {
        width: 100%;
      }
    }

    @media (min-width: 769px) {
      .mobile-toolbar-card {
        display: none;
      }

      .desktop-only {
        display: block;
      }
    }
  `]
})
export class PriceHistoryPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private priceUpdateLogService = inject(PriceUpdateLogService);
  private portfolioService = inject(PortfolioService);
  private snackBar = inject(MatSnackBar);
  private toolbar = inject(ToolbarService);
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  // Data
  logs: PriceUpdateLog[] = [];
  portfolios: Portfolio[] = [];
  dashboardStats: DashboardStats | null = null;

  // Pagination
  totalElements = 0;
  currentPage = 0;
  pageSize = 25;

  // State
  loading = false;
  isMobile = false;

  // Filters
  portfolioFilter = new FormControl<number | null>(null);
  statusFilter = new FormControl<string | null>(null);
  updateTypeFilter = new FormControl<string | null>(null);
  symbolSearch = new FormControl('');
  startDateFilter = new FormControl<Date | null>(null);
  endDateFilter = new FormControl<Date | null>(null);

  // Table columns
  displayedColumns = ['updateDate', 'portfolio', 'symbol', 'priceChange', 'status', 'updateType', 'executionTime'];

  ngOnInit(): void {
    // Setup mobile detection and responsive toolbar
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        // Desktop: Show toolbar in header, Mobile: Hide from header (show inline)
        if (!this.isMobile) {
          this.toolbar.setControls(PriceHistoryToolbarControlsComponent);
        } else {
          this.toolbar.setControls(null);
        }
      });

    this.loadPortfolios();
    this.loadDashboardStats();
    this.setupFilters();
    this.setupToolbarActions();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.toolbar.setControls(null);
  }

  private loadPortfolios(): void {
    this.portfolioService.getPortfolios()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

  private loadDashboardStats(): void {
    this.priceUpdateLogService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dashboardStats = response.data;
          }
        },
        error: (error) => {
          console.error('Failed to load dashboard stats:', error);
        }
      });
  }

  private setupFilters(): void {
    // Get initial filters from query params
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['portfolioId']) {
          this.portfolioFilter.setValue(Number(params['portfolioId']));
        }
        if (params['startDate']) {
          this.startDateFilter.setValue(new Date(params['startDate']));
        }
        if (params['endDate']) {
          this.endDateFilter.setValue(new Date(params['endDate']));
        }
      });

    // Setup search debouncing
    this.symbolSearch.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private setupToolbarActions(): void {
    // React to toolbar actions via query params
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['applyFilters']) {
          this.applyFilters();
        }
        if (params['clearFilters']) {
          this.clearFilters();
        }
        if (params['refreshData']) {
          this.loadLogs();
        }
        if (params['exportData']) {
          this.exportData();
        }
      });
  }

  private loadInitialData(): void {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    this.startDateFilter.setValue(startDate);
    this.endDateFilter.setValue(endDate);

    this.applyFilters();
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadLogs();
  }

  clearFilters(): void {
    this.portfolioFilter.setValue(null);
    this.statusFilter.setValue(null);
    this.updateTypeFilter.setValue(null);
    this.symbolSearch.setValue('');
    this.startDateFilter.setValue(null);
    this.endDateFilter.setValue(null);
    this.currentPage = 0;
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;

    const startDate = this.startDateFilter.value;
    const endDate = this.endDateFilter.value;

    if (!startDate || !endDate) {
      this.snackBar.open('Please select both start and end dates', 'Close', { duration: 3000 });
      this.loading = false;
      return;
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    this.priceUpdateLogService.getLogsWithFilters(
      this.portfolioFilter.value,
      startDateStr,
      endDateStr,
      this.statusFilter.value,
      this.currentPage,
      this.pageSize
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.logs = response.data.content;
          this.totalElements = response.data.totalElements;

          // Filter by symbol if search term is provided
          const searchTerm = this.symbolSearch.value?.toLowerCase().trim();
          if (searchTerm) {
            this.logs = this.logs.filter(log =>
              log.symbol.toLowerCase().includes(searchTerm) ||
              log.companyName.toLowerCase().includes(searchTerm)
            );
          }
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load logs:', error);
        this.snackBar.open('Failed to load price update logs', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  showLogDetails(log: PriceUpdateLog): void {
    // Show detailed information in a snackbar or could open a dialog
    let message = `${log.symbol}: `;
    if (log.updateStatus === 'SUCCESS') {
      message += `Price updated from ${log.oldPrice} to ${log.newPrice}`;
    } else {
      message += `Update failed: ${log.errorMessage || 'Unknown error'}`;
    }

    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'success-chip';
      case 'FAILED': return 'failed-chip';
      case 'SKIPPED': return 'skipped-chip';
      case 'PRICE_CHANGE_REJECTED': return 'rejected-chip';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'Success';
      case 'FAILED': return 'Failed';
      case 'SKIPPED': return 'Skipped';
      case 'PRICE_CHANGE_REJECTED': return 'Rejected';
      default: return status;
    }
  }

  getUpdateTypeText(type: string): string {
    switch (type) {
      case 'SCHEDULED_DAILY': return 'Scheduled';
      case 'MANUAL_SINGLE': return 'Manual';
      case 'MANUAL_BULK': return 'Bulk';
      case 'MANUAL_BY_DATE': return 'By Date';
      default: return type;
    }
  }

  exportData(): void {
    if (this.logs.length === 0) {
      this.snackBar.open('No data to export', 'Close', { duration: 3000 });
      return;
    }

    // Create CSV content
    const headers = ['Date', 'Portfolio', 'Symbol', 'Company', 'Old Price', 'New Price', 'Change %', 'Status', 'Type', 'Execution Time'];
    const csvContent = [
      headers.join(','),
      ...this.logs.map(log => [
        log.updateDate,
        `"${log.portfolioName}"`,
        log.symbol,
        `"${log.companyName}"`,
        log.oldPrice || '',
        log.newPrice || '',
        log.priceChangePercentage || '',
        log.updateStatus,
        log.updateType,
        log.executionTimeMs || ''
      ].join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `price-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Data exported successfully', 'Close', { duration: 3000 });
  }

  goBack(): void {
    this.router.navigate(['/holdings']);
  }
}
