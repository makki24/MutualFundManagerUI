import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-portfolio-details-toolbar-controls',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <!-- Desktop Layout - Hidden on Mobile -->
    @if (!isMobile) {
      <button mat-button (click)="viewTransactions()" matTooltip="View Transactions" class="desktop-action-btn">
        <mat-icon>receipt_long</mat-icon>
        <span>View Transactions</span>
      </button>

      @if (isAdmin) {
        <button mat-button (click)="manageCharges()" matTooltip="Manage Transaction Charges" class="desktop-action-btn">
          <mat-icon>account_balance</mat-icon>
          <span>Transaction Charges</span>
        </button>

        <button mat-button (click)="manageFees()" matTooltip="Manage Fees" class="desktop-action-btn">
          <mat-icon>account_balance_wallet</mat-icon>
          <span>Manage Fees</span>
        </button>

        <button mat-button (click)="manageHoldings()" matTooltip="Manage Holdings" class="desktop-action-btn">
          <mat-icon>pie_chart</mat-icon>
          <span>Manage Holdings</span>
        </button>

        <button mat-button (click)="manageChargeConfig()" matTooltip="Configure Charges" class="desktop-action-btn">
          <mat-icon>settings</mat-icon>
          <span>Charge Config</span>
        </button>
      }
    }
  `,
  styles: [
    `
    :host {
      display: contents;
    }

    /* Desktop Styles */
    .desktop-action-btn {
      margin-left: 8px;
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
        gap: 8px;
        flex-wrap: wrap;
      }
    }
    `
  ]
})
export class PortfolioDetailsToolbarControlsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  isAdmin = false;
  portfolioId!: number;
  isMobile = false;

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    
    // Setup mobile detection
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });
    
    // find id from current route (/portfolios/:id)
    let ar: ActivatedRoute | null = this.route;
    while (ar && !ar.snapshot.paramMap.get('id') && ar.firstChild) {
      ar = ar.firstChild;
    }
    const idParam = (ar || this.route).snapshot.paramMap.get('id');
    this.portfolioId = Number(idParam);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  viewTransactions(): void {
    if (!this.portfolioId) return;
    this.router.navigate(['/transactions/portfolio', this.portfolioId]);
  }

  manageFees(): void {
    if (!this.portfolioId) return;
    this.router.navigate(['/portfolios', this.portfolioId, 'fees']);
  }

  manageCharges(): void {
    if (!this.portfolioId) return;
    this.router.navigate(['/transaction-charges', this.portfolioId]);
  }

  manageHoldings(): void {
    if (!this.portfolioId) return;
    this.router.navigate(['/holdings'], { queryParams: { portfolioId: this.portfolioId } });
  }

  manageChargeConfig(): void {
    if (!this.portfolioId) return;
    this.router.navigate(['/charge-config'], { queryParams: { portfolioId: this.portfolioId } });
  }
}
