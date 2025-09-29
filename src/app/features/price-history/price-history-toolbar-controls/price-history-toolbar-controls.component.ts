import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { PortfolioService } from '../../../core/services/portfolio.service';
import { Portfolio } from '../../../core/models/portfolio.model';

@Component({
  selector: 'app-price-history-toolbar-controls',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatDialogModule,
  ],
  template: `
    <button
      mat-stroked-button
      (click)="refreshDataFromToolbar()"
      matTooltip="Refresh Data"
      class="desktop-action-btn"
    >
      <mat-icon>refresh</mat-icon>
      Refresh
    </button>

  `,
  styles: [
    `
    :host {
      display: contents;
    }

    /* Desktop Styles */
    .portfolio-selector-desktop {
      min-width: 180px;
      margin-right: 12px;
    }

    .date-picker-desktop {
      min-width: 140px;
      margin-right: 12px;
    }

    .desktop-action-btn {
      margin-right: 8px;
      height: 40px;
      white-space: nowrap;
    }

    .desktop-action-btn mat-icon {
      margin-right: 6px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      :host {
        display: none; /* Hide from header on mobile */
      }
    }

    @media (min-width: 769px) {
      :host {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .portfolio-selector-desktop .mat-mdc-form-field-infix,
      .date-picker-desktop .mat-mdc-form-field-infix {
        min-height: 40px;
      }
    }

    @media (max-width: 1200px) {
      .desktop-action-btn {
        padding: 0 12px;
      }

      .desktop-action-btn .mat-icon {
        margin-right: 4px;
      }
    }

    @media (max-width: 1024px) {
      .portfolio-selector-desktop {
        min-width: 160px;
      }

      .date-picker-desktop {
        min-width: 120px;
      }
    }
    `
  ]
})
export class PriceHistoryToolbarControlsComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  portfolios: Portfolio[] = [];
  selectedPortfolioId = new FormControl<number | null>(null, { nonNullable: false });
  startDateControl = new FormControl<Date | null>(null);
  endDateControl = new FormControl<Date | null>(null);

  ngOnInit(): void {
    this.loadPortfolios();
    this.setupQueryParamSync();
    this.setDefaultDateRange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPortfolios(): void {
    this.portfolioService.getPortfolios()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          if (resp.success) {
            this.portfolios = resp.data || [];
          }
        },
        error: (error) => {
          console.error('Failed to load portfolios:', error);
        }
      });
  }

  private setupQueryParamSync(): void {
    // Sync with URL query parameters
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['portfolioId']) {
          this.selectedPortfolioId.setValue(Number(params['portfolioId']), { emitEvent: false });
        }
        if (params['startDate']) {
          this.startDateControl.setValue(new Date(params['startDate']), { emitEvent: false });
        }
        if (params['endDate']) {
          this.endDateControl.setValue(new Date(params['endDate']), { emitEvent: false });
        }
      });

    // Update URL when controls change
    this.selectedPortfolioId.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.updateQueryParams({ portfolioId: value });
      });

    this.startDateControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.updateQueryParams({ startDate: value?.toISOString().split('T')[0] || null });
      });

    this.endDateControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.updateQueryParams({ endDate: value?.toISOString().split('T')[0] || null });
      });
  }

  private setDefaultDateRange(): void {
    // Set default date range (last 30 days) if not already set
    if (!this.startDateControl.value && !this.endDateControl.value) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      this.startDateControl.setValue(startDate);
      this.endDateControl.setValue(endDate);
    }
  }

  private updateQueryParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  applyFiltersFromToolbar(): void {
    // Trigger filter application by updating a query param
    this.updateQueryParams({ applyFilters: Date.now() });
  }

  clearFiltersFromToolbar(): void {
    this.selectedPortfolioId.setValue(null);
    this.startDateControl.setValue(null);
    this.endDateControl.setValue(null);

    // Set default date range after clearing
    setTimeout(() => {
      this.setDefaultDateRange();
    }, 100);

    this.updateQueryParams({
      portfolioId: null,
      startDate: null,
      endDate: null,
      clearFilters: Date.now()
    });
  }

  exportDataFromToolbar(): void {
    // Trigger export functionality
    this.updateQueryParams({ exportData: Date.now() });
  }

  refreshDataFromToolbar(): void {
    // Trigger data refresh
    this.updateQueryParams({ refreshData: Date.now() });
  }

  viewDashboardFromToolbar(): void {
    this.router.navigate(['/dashboard']);
  }
}
