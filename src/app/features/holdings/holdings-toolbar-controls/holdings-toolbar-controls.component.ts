import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UpdateByDateDialogComponent } from '../update-by-date-dialog/update-by-date-dialog.component';
import { Router } from '@angular/router';

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
    MatDialogModule,
  ],
  template: `
    <mat-select
      class="toolbar-select compact"
      [formControl]="selectedPortfolioId"
      aria-label="Select Portfolio"
    >
      @for (p of portfolios; track p.id) {
        <mat-option [value]="p.id">{{ p.name }}</mat-option>
      }
    </mat-select>

    <button
      mat-button
      (click)="addHoldingFromToolbar()"
      [disabled]="!selectedPortfolioId.value"
      matTooltip="Add Holding"
    >
      <mat-icon>add</mat-icon>
      <span class="hide-sm">Add Holding</span>
    </button>

    <button
      mat-button
      (click)="updatePricesFromToolbar()"
      [disabled]="!selectedPortfolioId.value"
      matTooltip="Update Prices"
    >
      <mat-icon>refresh</mat-icon>
      <span class="hide-sm">Update Prices</span>
    </button>

    <button
      mat-button
      (click)="updatePricesByDateFromToolbar()"
      [disabled]="!selectedPortfolioId.value"
      matTooltip="Update Prices by Date"
    >
      <mat-icon>event</mat-icon>
      <span class="hide-sm">Update by Date</span>
    </button>
  `,
  styles: [
    `
    :host { display: contents; }
    .toolbar-select.compact.mat-mdc-select {
      height: 32px;
      line-height: 32px;
      width: 160px;
      min-width: 0;
      border: 1px solid rgba(0, 0, 0, 0.23);
      border-radius: 4px;
    }
    .toolbar-select .mat-mdc-select-trigger {
      height: 28px;
      display: flex;
      align-items: center;
      padding: 0 8px;
    }
    .toolbar-select .mat-mdc-select-value,
    .toolbar-select .mat-mdc-select-value-text {
      font-size: 13px;
      line-height: 20px;
    }
    .toolbar-select.compact.mat-mdc-select:hover {
      border-color: rgba(0, 0, 0, 0.37);
    }
    .toolbar-select.compact.mat-mdc-select:focus-within {
      border-color: #1976d2;
    }
    `
  ]
})
export class HoldingsToolbarControlsComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

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
    const ref = this.dialog.open(UpdateByDateDialogComponent, { width: '360px' });
    ref.afterClosed().subscribe(date => {
      if (!date) return;
      this.router.navigate(['/holdings'], {
        queryParams: { updatePricesByDate: date },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }
}
