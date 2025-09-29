import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UpdateByDateDialogComponent } from '../update-by-date-dialog/update-by-date-dialog.component';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { PortfolioService } from '../../../core/services/portfolio.service';
import { Portfolio } from '../../../core/models/portfolio.model';

@Component({
  selector: 'app-holdings-toolbar-controls',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
  template: `
    <!-- Desktop Layout Only - Hidden on Mobile -->
    <mat-form-field appearance="outline" class="portfolio-selector-desktop">
      <mat-label>Portfolio</mat-label>
      <mat-select
        [formControl]="selectedPortfolioId"
        aria-label="Select Portfolio"
      >
        @for (p of portfolios; track p.id) {
          <mat-option [value]="p.id">{{ p.name }}</mat-option>
        }
      </mat-select>
    </mat-form-field>

    <button
      mat-raised-button
      color="primary"
      (click)="addHoldingFromToolbar()"
      [disabled]="!selectedPortfolioId.value"
      matTooltip="Add Holding"
      class="desktop-action-btn"
    >
      <mat-icon>add</mat-icon>
      Add Holding
    </button>

    <button
      mat-stroked-button
      (click)="updatePricesFromToolbar()"
      [disabled]=" !selectedPortfolioId.value"
      matTooltip="Update Prices"
      class="desktop-action-btn"
    >
      <mat-icon>refresh</mat-icon>
      Update Prices
    </button>

    <button
      mat-stroked-button
      (click)="updatePricesByDateFromToolbar()"
      [disabled]="!selectedPortfolioId.value"
      matTooltip="Update Prices by Date"
      class="desktop-action-btn"
    >
      <mat-icon>event</mat-icon>
      Update by Date
    </button>

    <button
      mat-stroked-button
      (click)="viewPriceHistoryFromToolbar()"
      [disabled]="!selectedPortfolioId.value"
      matTooltip="View Price Update History"
      class="desktop-action-btn"
    >
      <mat-icon>history</mat-icon>
      Price History
    </button>
  `,
  styles: [
    `
    :host {
      display: contents;
    }

    /* Desktop Styles */
    .portfolio-selector-desktop {
      min-width: 200px;
      margin-right: 16px;
    }

    .desktop-action-btn {
      margin-right: 8px;
      height: 40px;
    }

    .desktop-action-btn mat-icon {
      margin-right: 8px;
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
        gap: 16px;
        flex-wrap: wrap;
      }

      .portfolio-selector-desktop .mat-mdc-form-field-infix {
        min-height: 40px;
      }
    }
    `
  ]
})
export class HoldingsToolbarControlsComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  portfolios: Portfolio[] = [];
  selectedPortfolioId = new FormControl<number | null>(null, { nonNullable: false });

  ngOnInit(): void {

    // Load portfolios and sync selection from URL
    this.portfolioService.getPortfolios().subscribe({
      next: (resp) => {
        if (resp.success) {
          this.portfolios = resp.data || [];
          const url = new URL(window.location.href);
          const pid = url.searchParams.get('portfolioId');
          const id = pid ? Number(pid) : null;
          const effective = id && this.portfolios.find(p => p.id === id) ? id : (this.portfolios[0]?.id ?? null);
          this.selectedPortfolioId.setValue(effective, { emitEvent: false });
          // Merge into URL without adding to history
          this.router.navigate(['/holdings'], { queryParams: { portfolioId: effective }, queryParamsHandling: 'merge', replaceUrl: true });
        }
      },
      error: () => {}
    });

    this.selectedPortfolioId.valueChanges.subscribe(value => {
      this.router.navigate(['/holdings'], {
        queryParams: { portfolioId: value ?? null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addHoldingFromToolbar(): void {
    if (!this.selectedPortfolioId.value) return;
    this.router.navigate(['/holdings'], {
      queryParams: { addHolding: true },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  updatePricesFromToolbar(): void {
    if (!this.selectedPortfolioId.value) return;
    this.router.navigate(['/holdings'], {
      queryParams: { updatePrices: true },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  updatePricesByDateFromToolbar(): void {
    if (!this.selectedPortfolioId.value) return;
    const ref = this.dialog.open(UpdateByDateDialogComponent, {
      width: '360px',
      maxWidth: '500px'
    });
    ref.afterClosed().subscribe(date => {
      if (!date) return;
      this.router.navigate(['/holdings'], {
        queryParams: { updatePricesByDate: date },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  viewPriceHistoryFromToolbar(): void {
    if (!this.selectedPortfolioId.value) return;
    this.router.navigate(['/price-history'], {
      queryParams: { portfolioId: this.selectedPortfolioId.value },
    });
  }
}
