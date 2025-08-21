import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { PortfolioService } from '../../../core/services/portfolio.service';
import { InvestmentService } from '../../../core/services/investment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Portfolio } from '../../../core/models/portfolio.model';
import { Investment } from '../../../core/models/investment.model';
import { AddUserToPortfolioDialogComponent } from './add-user-to-portfolio-dialog/add-user-to-portfolio-dialog.component';
import { WithdrawUserDialogComponent } from './withdraw-user-dialog/withdraw-user-dialog.component';
import { ToolbarService } from '../../../layout/toolbar/toolbar.service';
import { PortfolioDetailsToolbarControlsComponent } from './portfolio-details-toolbar-controls.component';

@Component({
  selector: 'app-portfolio-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="portfolio-details-container">
      @if (isLoading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading portfolio details...</p>
        </div>
      } @else if (portfolio) {
        <!-- Portfolio Stats card (header moved to global toolbar) -->
        <mat-card class="portfolio-header-card">
          <mat-card-content>
            <div class="portfolio-stats">
              <div class="stat-item">
                <div class="stat-label">NAV</div>
                <div class="stat-value">{{ portfolio.navValue | currency:'INR':'symbol':'1.4-4' }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Total AUM</div>
                <div class="stat-value">{{ portfolio.totalPortfolioValue | currency:'INR':'symbol':'1.0-0' }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Total Units</div>
                <div class="stat-value">{{ portfolio.totalUnits | number:'1.4-4' }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Available Cash</div>
                <div class="stat-value">{{ portfolio.remainingCash | currency:'INR':'symbol':'1.0-0' }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Investors</div>
                <div class="stat-value">{{ portfolio.totalInvestors }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Holdings value</div>
                <div class="stat-value">{{ portfolio.totalHoldingsValue | currency:'INR':'symbol':'1.0-0' }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Portfolio Tabs -->
        <mat-card class="portfolio-content-card">
          <mat-tab-group>
            <!-- Investors Tab -->
            <mat-tab label="Investors">
              <div class="tab-content">
                @if (investmentsLoading) {
                  <div class="loading-container">
                    <mat-spinner diameter="40"></mat-spinner>
                    <p>Loading investors...</p>
                  </div>
                } @else if (portfolioInvestments.length > 0) {
                  <div class="investors-section">
                    <div class="section-header">
                      <h3>Portfolio Investors ({{ portfolioInvestments.length }})</h3>
                      @if (isAdmin) {
                        <button mat-raised-button color="primary" (click)="openAddUserDialog()">
                          <mat-icon>person_add</mat-icon>
                          Add User
                        </button>
                      }
                    </div>

                    <div class="table-container">
                      <table mat-table [dataSource]="portfolioInvestments" class="investors-table">

                        <!-- User Column -->
                        <ng-container matColumnDef="user">
                          <th mat-header-cell *matHeaderCellDef>Investor</th>
                          <td mat-cell *matCellDef="let investment">
                            <div class="user-info">
                              <div class="user-name">{{ investment.user.username }}</div>
                              <div class="user-id">ID: {{ investment.user.id }}</div>
                            </div>
                          </td>
                        </ng-container>

                        <!-- Investment Column -->
                        <ng-container matColumnDef="investment">
                          <th mat-header-cell *matHeaderCellDef>Investment</th>
                          <td mat-cell *matCellDef="let investment">
                            <div class="investment-info">
                              <div class="amount">{{ investment.totalInvested | currency:'INR':'symbol':'1.2-2' }}</div>
                              <div class="units">{{ investment.unitsHeld | number:'1.4-4' }} units</div>
                              <div class="avg-nav">Avg NAV: {{ investment.averageNav | currency:'INR':'symbol':'1.4-4' }}</div>
                            </div>
                          </td>
                        </ng-container>

                        <!-- Current Value Column -->
                        <ng-container matColumnDef="currentValue">
                          <th mat-header-cell *matHeaderCellDef>Current Value</th>
                          <td mat-cell *matCellDef="let investment">
                            <div class="value-info">
                              <div class="current-value">{{ investment.currentValue | currency:'INR':'symbol':'1.2-2' }}</div>
                              <div class="returns"
                                   [class.positive]="investment.totalReturns >= 0"
                                   [class.negative]="investment.totalReturns < 0">
                                {{ investment.totalReturns >= 0 ? '+' : '' }}{{ investment.totalReturns | currency:'INR':'symbol':'1.2-2' }}
                                ({{ investment.returnPercentage | number:'1.2-2' }}%)
                              </div>
                            </div>
                          </td>
                        </ng-container>

                        <!-- AUM Share Column -->
                        <ng-container matColumnDef="aumShare">
                          <th mat-header-cell *matHeaderCellDef>AUM Share</th>
                          <td mat-cell *matCellDef="let investment">
                            <div class="aum-share">
                              <mat-chip>{{ investment.aumPercentage | number:'1.2-2' }}%</mat-chip>
                            </div>
                          </td>
                        </ng-container>

                        <!-- Fees Column -->
                        <ng-container matColumnDef="fees">
                          <th mat-header-cell *matHeaderCellDef>Fees Paid</th>
                          <td mat-cell *matCellDef="let investment">
                            {{ investment.totalChargesPaid | currency:'INR':'symbol':'1.2-2' }}
                          </td>
                        </ng-container>

                        <!-- Actions Column -->
                        <ng-container matColumnDef="actions">
                          <th mat-header-cell *matHeaderCellDef>Actions</th>
                          <td mat-cell *matCellDef="let investment">
                            <button mat-icon-button [matMenuTriggerFor]="investmentMenu">
                              <mat-icon>more_vert</mat-icon>
                            </button>
                            <mat-menu #investmentMenu="matMenu">
                              <button mat-menu-item (click)="viewInvestmentDetails(investment)">
                                <mat-icon>visibility</mat-icon>
                                View Details
                              </button>
                              @if (isAdmin) {
                                <button mat-menu-item (click)="openWithdrawDialog(investment)">
                                  <mat-icon>remove_circle</mat-icon>
                                  Withdraw
                                </button>
                              }
                            </mat-menu>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="investorColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: investorColumns;"></tr>
                      </table>
                    </div>
                  </div>
                } @else {
                  <div class="no-investors">
                    <mat-icon>people_outline</mat-icon>
                    <h3>No Investors Yet</h3>
                    <p>This portfolio doesn't have any investors. Add users to start building the portfolio.</p>
                    @if (isAdmin) {
                      <button mat-raised-button color="primary" (click)="openAddUserDialog()">
                        Add First Investor
                      </button>
                    }
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Holdings Tab -->
            <mat-tab label="Holdings">
              <div class="tab-content">
                <div class="holdings-section">
                  <div class="section-header">
                    <h3>Portfolio Holdings ({{ portfolio.totalHoldings }})</h3>
                    @if (isAdmin) {
                      <button mat-raised-button color="primary" (click)="manageHoldings()">
                        <mat-icon>pie_chart</mat-icon>
                        Manage Holdings
                      </button>
                    }
                  </div>
                  <div class="holdings-preview">
                    <mat-icon>trending_up</mat-icon>
                    <h4>Holdings Overview</h4>
                    <p>View and manage portfolio holdings, buy/sell stocks, and track performance.</p>
                    <div class="holdings-stats">
                      <div class="stat-card">
                        <div class="stat-label">Total Holdings</div>
                        <div class="stat-value">{{ portfolio.totalHoldings }}</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-label">Holdings Value</div>
                        <div class="stat-value">{{ portfolio.totalHoldingsValue | currency:'INR':'symbol':'1.0-0' }}</div>
                      </div>
                    </div>
                    <button mat-raised-button color="primary" (click)="manageHoldings()">
                      <mat-icon>open_in_new</mat-icon>
                      Open Holdings Manager
                    </button>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Performance Tab -->
            <mat-tab label="Performance">
              <div class="tab-content">
                <div class="coming-soon">
                  <mat-icon>trending_up</mat-icon>
                  <h3>Performance Analytics</h3>
                  <p>Portfolio performance analytics coming soon!</p>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      } @else {
        <div class="error-container">
          <mat-icon>error_outline</mat-icon>
          <h3>Portfolio Not Found</h3>
          <p>The requested portfolio could not be found.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Back to Portfolios
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .portfolio-details-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container mat-spinner, .error-container mat-icon {
      margin-bottom: 20px;
    }

    .error-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.5;
    }

    .portfolio-header-card {
      margin-bottom: 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .portfolio-info {
      flex: 1;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .portfolio-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .portfolio-content-card {
      min-height: 500px;
    }

    .tab-content {
      padding: 20px;
    }

    .investors-section, .holdings-section {
      width: 100%;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .table-container {
      overflow-x: auto;
    }

    .investors-table {
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

    .user-id {
      font-size: 12px;
      color: #666;
    }

    .investment-info {
      display: flex;
      flex-direction: column;
    }

    .amount {
      font-weight: 500;
      font-size: 14px;
    }

    .units, .avg-nav {
      font-size: 12px;
      color: #666;
    }

    .value-info {
      display: flex;
      flex-direction: column;
    }

    .current-value {
      font-weight: 500;
      font-size: 14px;
    }

    .returns {
      font-size: 12px;
    }

    .returns.positive {
      color: #4caf50;
    }

    .returns.negative {
      color: #f44336;
    }

    .aum-share {
      display: flex;
      justify-content: center;
    }

    .holdings-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      background: #f9f9f9;
      border-radius: 8px;
      margin-top: 20px;
    }

    .holdings-preview mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #1976d2;
    }

    .holdings-preview h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
    }

    .holdings-preview p {
      margin: 0 0 20px 0;
      color: #666;
      max-width: 400px;
    }

    .holdings-stats {
      display: flex;
      gap: 20px;
      margin: 20px 0;
    }

    .stat-card {
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      min-width: 120px;
    }

    .stat-card .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .stat-card .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .no-investors, .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #666;
    }

    .no-investors mat-icon, .coming-soon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-investors h3, .coming-soon h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
    }

    .no-investors p, .coming-soon p {
      margin: 0 0 24px 0;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .portfolio-details-container {
        padding: 10px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
        justify-content: center;
      }

      .portfolio-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .section-header h3 {
        text-align: center;
      }

      .holdings-stats {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class PortfolioDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private portfolioService = inject(PortfolioService);
  private investmentService = inject(InvestmentService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private toolbar = inject(ToolbarService);

  portfolioId!: number;
  portfolio: Portfolio | null = null;
  portfolioInvestments: Investment[] = [];
  isLoading = true;
  investmentsLoading = true;
  isAdmin = false;
  investorColumns = ['user', 'investment', 'currentValue', 'aumShare', 'fees', 'actions'];

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.portfolioId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.portfolioId) {
      this.loadPortfolioDetails();
      this.loadPortfolioInvestments();
      // Register toolbar controls immediately (title set after details load)
      this.toolbar.setControls(PortfolioDetailsToolbarControlsComponent);
    } else {
      this.router.navigate(['/portfolios']);
    }
  }

  ngOnDestroy(): void {
    this.toolbar.clear();
  }

  loadPortfolioDetails(): void {
    this.isLoading = true;
    this.portfolioService.getPortfolioDetails(this.portfolioId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const p = response.data as Portfolio;
          this.portfolio = p;
          // Set toolbar title to include name and date
          const createdBy = p.createdBy?.username || 'Unknown';
          const dateStr = p.createdAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(p.createdAt)) : '';
          const title = dateStr ? `${p.name} • ${createdBy} • ${dateStr}` : `${p.name} • ${createdBy}`;
          this.toolbar.setTitle(title);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load portfolio details:', error);
        this.snackBar.open('Failed to load portfolio details', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  loadPortfolioInvestments(): void {
    this.investmentsLoading = true;
    this.investmentService.getPortfolioInvestments(this.portfolioId).subscribe({
      next: (response) => {
        if (response.success) {
          this.portfolioInvestments = response.data || [];
        }
        this.investmentsLoading = false;
      },
      error: (error) => {
        console.error('Failed to load portfolio investments:', error);
        this.snackBar.open('Failed to load portfolio investments', 'Close', { duration: 5000 });
        this.investmentsLoading = false;
      }
    });
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(AddUserToPortfolioDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { portfolioId: this.portfolioId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPortfolioInvestments();
        this.loadPortfolioDetails(); // Refresh portfolio data
        this.snackBar.open('User added to portfolio successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openWithdrawDialog(investment: Investment): void {
    const dialogRef = this.dialog.open(WithdrawUserDialogComponent, {
      width: '600px',
      data: {
        portfolioId: this.portfolioId,
        investment: investment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPortfolioInvestments();
        this.loadPortfolioDetails();
        this.snackBar.open('User withdrawal processed successfully', 'Close', { duration: 3000 });
      }
    });
  }

  viewInvestmentDetails(investment: Investment): void {
    this.snackBar.open(`Investment details for ${investment.user.username} coming soon!`, 'Close', { duration: 3000 });
  }

  manageFees(): void {
    this.router.navigate(['/portfolios', this.portfolioId, 'fees']);
  }

  manageHoldings(): void {
    this.router.navigate(['/holdings'], { queryParams: { portfolioId: this.portfolioId } });
  }

  viewTransactions(): void {
    this.router.navigate(['/transactions/portfolio', this.portfolioId]);
  }

  goBack(): void {
    this.router.navigate(['/portfolios']);
  }
}
