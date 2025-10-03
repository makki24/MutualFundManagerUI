import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TransactionChargeService } from '../../core/services/transaction-charge.service';
import { TransactionCharge, ChargeStatus, ChargeStatistics } from '../../core/models/transaction-charge.model';
import { AuthService } from '../../core/services/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChargeDetailsDialogComponent } from './charge-details-dialog/charge-details-dialog.component';

@Component({
  selector: 'app-transaction-charges-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="app-container">
      <!-- Statistics Cards -->
      @if (statistics && !isLoading) {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ statistics.totalRecords }}</div>
              <div class="stat-label">Total Records</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ statistics.pendingReview }}</div>
              <div class="stat-label">Pending Review</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ statistics.readyToApply }}</div>
              <div class="stat-label">Ready to Apply</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">₹{{ statistics.totalChargesAmount | number:'1.2-2' }}</div>
              <div class="stat-label">Total Charges</div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      <!-- Filters Section -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>View Type</mat-label>
              <mat-select [formControl]="viewTypeControl">
                <mat-option value="all">All Charges</mat-option>
                <mat-option value="pending">Pending Review</mat-option>
                <mat-option value="ready">Ready to Apply</mat-option>
                <mat-option value="date">By Date</mat-option>
                <mat-option value="dateRange">Date Range</mat-option>
              </mat-select>
            </mat-form-field>

            @if (viewTypeControl.value === 'date') {
              <mat-form-field appearance="outline">
                <mat-label>Select Date</mat-label>
                <input matInput [matDatepicker]="datePicker" [formControl]="dateControl">
                <mat-datepicker-toggle matIconSuffix [for]="datePicker"></mat-datepicker-toggle>
                <mat-datepicker #datePicker></mat-datepicker>
              </mat-form-field>
            }

            @if (viewTypeControl.value === 'dateRange') {
              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startDatePicker" [formControl]="startDateControl">
                <mat-datepicker-toggle matIconSuffix [for]="startDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #startDatePicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endDatePicker" [formControl]="endDateControl">
                <mat-datepicker-toggle matIconSuffix [for]="endDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #endDatePicker></mat-datepicker>
              </mat-form-field>
            }

            @if (portfolioId) {
              <button mat-raised-button color="primary" (click)="calculateCharges()" [disabled]="isCalculating">
                @if (isCalculating) {
                  <mat-icon>hourglass_empty</mat-icon>
                } @else {
                  <mat-icon>calculate</mat-icon>
                }
                Calculate Charges
              </button>
            }
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading transaction charges...</p>
        </div>
      }

      <!-- Desktop Table View -->
      @if (!isLoading && !isMobile && charges.length > 0) {
        <mat-card class="table-card">
          <mat-card-content>
            <table mat-table [dataSource]="charges" class="charges-table">
              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let charge">{{ charge.calculationDate | date:'dd/MM/yyyy' }}</td>
              </ng-container>

              <!-- Portfolio Column -->
              <ng-container matColumnDef="portfolio">
                <th mat-header-cell *matHeaderCellDef>Portfolio</th>
                <td mat-cell *matCellDef="let charge">{{ charge.portfolio.name }}</td>
              </ng-container>

              <!-- Total Turnover Column -->
              <ng-container matColumnDef="turnover">
                <th mat-header-cell *matHeaderCellDef>Total Turnover</th>
                <td mat-cell *matCellDef="let charge">₹{{ charge.totalTurnover | number:'1.2-2' }}</td>
              </ng-container>

              <!-- Total Charges Column -->
              <ng-container matColumnDef="charges">
                <th mat-header-cell *matHeaderCellDef>Total Charges</th>
                <td mat-cell *matCellDef="let charge">₹{{ charge.totalCharges | number:'1.2-2' }}</td>
              </ng-container>

              <!-- Transaction Count Column -->
              <ng-container matColumnDef="transactions">
                <th mat-header-cell *matHeaderCellDef>Transactions</th>
                <td mat-cell *matCellDef="let charge">{{ charge.transactionCount }}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let charge">
                  <mat-chip [class]="getStatusClass(charge.status)">
                    {{ charge.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let charge">
                  <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="viewChargeDetails(charge)">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </button>
                    @if (charge.status === 'CALCULATED') {
                      <button [disabled]="true" mat-menu-item (click)="approveCharge(charge.id)">
                        <mat-icon>check_circle</mat-icon>
                        <span>Approve</span>
                      </button>
                      <button [disabled]="true" mat-menu-item (click)="rejectCharge(charge.id)">
                        <mat-icon>cancel</mat-icon>
                        <span>Reject</span>
                      </button>
                    }
                    @if (charge.status === 'REVIEWED') {
                      <button mat-menu-item (click)="applyCharge(charge.id)">
                        <mat-icon>done_all</mat-icon>
                        <span>Apply</span>
                      </button>
                    }
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }

      <!-- Mobile Card View -->
      @if (!isLoading && isMobile && charges.length > 0) {
        <div class="mobile-cards">
          @for (charge of charges; track charge.id) {
            <mat-card class="charge-card">
              <mat-card-header>
                <div class="charge-header">
                  <div class="charge-date">{{ charge.calculationDate | date:'dd/MM/yyyy' }}</div>
                  <mat-chip [class]="getStatusClass(charge.status)">{{ charge.status }}</mat-chip>
                </div>
                <div class="portfolio-name">{{ charge.portfolio.name }}</div>
              </mat-card-header>

              <mat-card-content>
                <div class="charge-details">
                  <div class="detail-row">
                    <span class="label">Total Turnover:</span>
                    <span class="value">₹{{ charge.totalTurnover | number:'1.2-2' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Total Charges:</span>
                    <span class="value">₹{{ charge.totalCharges | number:'1.2-2' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Transactions:</span>
                    <span class="value">{{ charge.transactionCount }}</span>
                  </div>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button (click)="viewChargeDetails(charge)">
                  <mat-icon>visibility</mat-icon>
                  Details
                </button>
                @if (charge.status === 'CALCULATED') {
                  <button [disabled]="true" mat-button color="primary" (click)="approveCharge(charge.id)">
                    <mat-icon>check_circle</mat-icon>
                    Approve
                  </button>
                  <button [disabled]="true" mat-button color="warn" (click)="rejectCharge(charge.id)">
                    <mat-icon>cancel</mat-icon>
                    Reject
                  </button>
                }
                @if (charge.status === 'REVIEWED') {
                  <button mat-button color="accent" (click)="applyCharge(charge.id)">
                    <mat-icon>done_all</mat-icon>
                    Apply
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading && charges.length === 0) {
        <div class="empty-state">
          <mat-icon>receipt_long</mat-icon>
          <h3>No Transaction Charges Found</h3>
          <p>No charges match the current filter criteria.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      min-height: calc(100vh - 64px);
      display: flex;
      flex-direction: column;
      padding: 24px;
      gap: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .subtitle {
      margin: 8px 0 0 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.875rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 600;
      color: #1976d2;
    }

    .stat-label {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }

    .filters-card {
      margin-bottom: 16px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filters-row mat-form-field {
      min-width: 200px;
    }

    .table-card {
      flex: 1;
    }

    .charges-table {
      width: 100%;
    }

    .mobile-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .charge-card {
      width: 100%;
    }

    .charge-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .charge-date {
      font-weight: 500;
      font-size: 1rem;
    }

    .portfolio-name {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }

    .charge-details {
      margin-top: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
    }

    .value {
      font-weight: 600;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0, 0, 0, 0.3);
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: rgba(0, 0, 0, 0.7);
    }

    .empty-state p {
      margin: 0;
      color: rgba(0, 0, 0, 0.5);
    }

    /* Status chip styles */
    .status-calculated {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-reviewed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-rejected {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-applied {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .app-container {
        padding: 16px;
        gap: 16px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .filters-row mat-form-field {
        min-width: unset;
        width: 100%;
      }

      .page-header h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class TransactionChargesPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private transactionChargeService = inject(TransactionChargeService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private dialog = inject(MatDialog);

  charges: TransactionCharge[] = [];
  statistics: ChargeStatistics | null = null;
  isLoading = false;
  isCalculating = false;
  isMobile = false;
  isAdmin = false;
  portfolioId: number | null = null;

  // Form controls
  viewTypeControl = new FormControl('all');
  dateControl = new FormControl();
  startDateControl = new FormControl();
  endDateControl = new FormControl();

  displayedColumns = ['date', 'portfolio', 'turnover', 'charges', 'transactions', 'status', 'actions'];

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    // Check if we have a portfolioId from route params
    this.portfolioId = Number(this.route.snapshot.paramMap.get('portfolioId')) || null;

    // Setup mobile detection
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Setup form control listeners
    this.setupFormListeners();

    // Load initial data
    this.loadCharges();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormListeners(): void {
    this.viewTypeControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadCharges();
      });

    this.dateControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.viewTypeControl.value === 'date' && this.dateControl.value) {
          this.loadCharges();
        }
      });

    this.startDateControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.viewTypeControl.value === 'dateRange' && this.startDateControl.value && this.endDateControl.value) {
          this.loadCharges();
        }
      });

    this.endDateControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.viewTypeControl.value === 'dateRange' && this.startDateControl.value && this.endDateControl.value) {
          this.loadCharges();
        }
      });
  }

  private loadCharges(): void {
    this.isLoading = true;
    const viewType = this.viewTypeControl.value;

    let request;

    if (this.portfolioId) {
      request = this.transactionChargeService.getChargesByPortfolio(this.portfolioId);
    } else {
      switch (viewType) {
        case 'pending':
          request = this.transactionChargeService.getPendingReviewCharges();
          break;
        case 'ready':
          request = this.transactionChargeService.getReadyToApplyCharges();
          break;
        case 'date':
          if (this.dateControl.value) {
            const dateStr = this.formatDate(this.dateControl.value);
            request = this.transactionChargeService.getChargesByDate(dateStr);
          } else {
            this.isLoading = false;
            return;
          }
          break;
        case 'dateRange':
          if (this.startDateControl.value && this.endDateControl.value) {
            const startDateStr = this.formatDate(this.startDateControl.value);
            const endDateStr = this.formatDate(this.endDateControl.value);
            request = this.transactionChargeService.getChargesByDateRange(startDateStr, endDateStr);
          } else {
            this.isLoading = false;
            return;
          }
          break;
        default:
          // For 'all' or any other case, we'll use pending review as default
          request = this.transactionChargeService.getPendingReviewCharges();
      }
    }

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (charges) => {
        this.charges = charges;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading charges:', error);
        this.snackBar.open('Failed to load transaction charges', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private loadStatistics(): void {
    this.transactionChargeService.getChargeStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
        }
      });
  }

  calculateCharges(): void {
    if (!this.portfolioId) return;

    this.isCalculating = true;
    const today = this.formatDate(new Date());

    this.transactionChargeService.calculateChargesForPortfolio(this.portfolioId, today)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (charge) => {
          this.snackBar.open('Charges calculated successfully', 'Close', { duration: 3000 });
          this.loadCharges();
          this.loadStatistics();
          this.isCalculating = false;
        },
        error: (error) => {
          console.error('Error calculating charges:', error);
          this.snackBar.open('Failed to calculate charges', 'Close', { duration: 3000 });
          this.isCalculating = false;
        }
      });
  }

  approveCharge(chargeId: number): void {
    this.transactionChargeService.approveCharge(chargeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Charge approved successfully', 'Close', { duration: 3000 });
          this.loadCharges();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error approving charge:', error);
          this.snackBar.open('Failed to approve charge', 'Close', { duration: 3000 });
        }
      });
  }

  rejectCharge(chargeId: number): void {
    this.transactionChargeService.rejectCharge(chargeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Charge rejected successfully', 'Close', { duration: 3000 });
          this.loadCharges();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error rejecting charge:', error);
          this.snackBar.open('Failed to reject charge', 'Close', { duration: 3000 });
        }
      });
  }

  applyCharge(chargeId: number): void {
    this.transactionChargeService.applyCharge(chargeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Charge applied successfully', 'Close', { duration: 3000 });
          this.loadCharges();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error applying charge:', error);
          this.snackBar.open('Failed to apply charge', 'Close', { duration: 3000 });
        }
      });
  }

  viewChargeDetails(charge: TransactionCharge): void {
    this.dialog.open(ChargeDetailsDialogComponent, {
      data: charge,
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      autoFocus: false,
      restoreFocus: false
    });
  }

  getStatusClass(status: ChargeStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
