import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-portfolio-details-toolbar-controls',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button mat-button (click)="viewTransactions()" matTooltip="View Transactions">
      <mat-icon>receipt_long</mat-icon>
      <span class="hide-sm">View Transactions</span>
    </button>

    @if (isAdmin) {
      <button mat-button (click)="manageFees()" matTooltip="Manage Fees">
        <mat-icon>account_balance_wallet</mat-icon>
        <span class="hide-sm">Manage Fees</span>
      </button>

      <button mat-button (click)="manageHoldings()" matTooltip="Manage Holdings">
        <mat-icon>pie_chart</mat-icon>
        <span class="hide-sm">Manage Holdings</span>
      </button>
    }
  `,
  styles: [
    `:host{display:contents}
     button { margin-left: 4px; }
    `
  ]
})
export class PortfolioDetailsToolbarControlsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  isAdmin = false;
  portfolioId!: number;

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    // find id from current route (/portfolios/:id)
    let ar: ActivatedRoute | null = this.route;
    while (ar && !ar.snapshot.paramMap.get('id') && ar.firstChild) {
      ar = ar.firstChild;
    }
    const idParam = (ar || this.route).snapshot.paramMap.get('id');
    this.portfolioId = Number(idParam);
  }

  viewTransactions(): void {
    if (!this.portfolioId) return;
    this.router.navigate(['/transactions/portfolio', this.portfolioId]);
  }

  manageFees(): void {
    if (!this.portfolioId) return;
    this.router.navigate(['/portfolios', this.portfolioId, 'fees']);
  }

  manageHoldings(): void {
    if (!this.portfolioId) return;
    this.router.navigate(['/holdings'], { queryParams: { portfolioId: this.portfolioId } });
  }
}
