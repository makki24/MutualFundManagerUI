import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { TransactionsListComponent } from '../transactions-list/transactions-list.component';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { Portfolio } from '../../../core/models/portfolio.model';
import { ToolbarService } from '../../../layout/toolbar/toolbar.service';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    TransactionsListComponent
  ],
  templateUrl: './transactions-page.component.html',
  styleUrls: ['./transactions-page.component.scss']
})
export class TransactionsPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly portfolioService = inject(PortfolioService);
  private readonly toolbar = inject(ToolbarService);

  portfolioId?: number;
  portfolio?: Portfolio;
  selectedTabIndex = 0;

  ngOnInit(): void {
    // Check if we're viewing transactions for a specific portfolio
    this.route.params.subscribe(params => {
      if (params['portfolioId']) {
        this.portfolioId = +params['portfolioId'];
        this.loadPortfolioDetails();
        // Default to portfolio transactions tab when portfolio ID is present
        this.selectedTabIndex = 1;
        this.toolbar.setTitle('Transactions');
      } else {
        this.toolbar.setTitle('Transactions');
      }
    });

    // Check for query params to determine default tab
    this.route.queryParams.subscribe(params => {
      if (params['view'] === 'portfolio') {
        this.selectedTabIndex = 1;
      } else if (params['view'] === 'user') {
        this.selectedTabIndex = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.toolbar.clear();
  }

  private loadPortfolioDetails(): void {
    if (this.portfolioId) {
      this.portfolioService.getPortfolioDetails(this.portfolioId).subscribe({
        next: (portfolio) => {
          this.portfolio = portfolio.data ?? undefined;
          if (this.portfolio?.name) {
            this.toolbar.setTitle(`Transactions • ${this.portfolio.name}`);
          }
        },
        error: (error) => {
          console.error('Error loading portfolio details:', error);
        }
      });
    }
  }
}
