import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { ChargeConfigService } from '../../core/services/charge-config.service';
import { ChargeConfig } from '../../core/models/charge-config.model';
import { CreateChargeConfigDialogComponent } from './create-charge-config-dialog.component';

@Component({
  selector: 'app-charge-config-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  template: `
    <div class="charge-config-container">
      <!-- Header -->

      <!-- Configurations List -->
      <mat-card class="configs-card">
        <mat-card-content>
          @if (loading()) {
            <div class="loading-state">
              <p>Loading charge configurations...</p>
            </div>
          } @else if (configs().length === 0) {
            <div class="empty-state">
              <mat-icon>settings</mat-icon>
              <h3>No Charge Configurations</h3>
              <p>Create a charge configuration to customize brokerage and other charges for this portfolio.</p>
              <button mat-raised-button color="primary" (click)="openCreateDialog()">
                <mat-icon>add</mat-icon>
                Create Configuration
              </button>
            </div>
          } @else {
            <!-- Desktop Table -->
            <div class="desktop-table">
              <table mat-table [dataSource]="configs()" class="configs-table">
                <!-- Charge Type Column -->
                <ng-container matColumnDef="chargeType">
                  <th mat-header-cell *matHeaderCellDef>Charge Type</th>
                  <td mat-cell *matCellDef="let config">
                    <strong>{{ config.chargeTypeDisplay }}</strong>
                  </td>
                </ng-container>

                <!-- Calculation Method Column -->
                <ng-container matColumnDef="calculationMethod">
                  <th mat-header-cell *matHeaderCellDef>Calculation Method</th>
                  <td mat-cell *matCellDef="let config">
                    {{ formatCalculationMethod(config.calculationMethod) }}
                  </td>
                </ng-container>

                <!-- Formula Column -->
                <ng-container matColumnDef="formula">
                  <th mat-header-cell *matHeaderCellDef>Formula</th>
                  <td mat-cell *matCellDef="let config">
                    <span class="formula-text">{{ config.calculationFormula }}</span>
                  </td>
                </ng-container>

                <!-- Applies To Column -->
                <ng-container matColumnDef="appliesTo">
                  <th mat-header-cell *matHeaderCellDef>Applies To</th>
                  <td mat-cell *matCellDef="let config">
                    <div class="applies-to-chips">
                      @if (config.appliesToBuy) {
                        <mat-chip class="buy-chip">Buy</mat-chip>
                      }
                      @if (config.appliesToSell) {
                        <mat-chip class="sell-chip">Sell</mat-chip>
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let config">
                    <mat-chip [class.active-chip]="config.isActive" [class.inactive-chip]="!config.isActive">
                      {{ config.isActive ? 'Active' : 'Inactive' }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let config">
                    <button mat-icon-button [matMenuTriggerFor]="menu" [matTooltip]="'Actions'">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="openEditDialog(config)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      @if (config.isActive) {
                        <button mat-menu-item (click)="deactivateConfig(config)">
                          <mat-icon>toggle_off</mat-icon>
                          <span>Deactivate</span>
                        </button>
                      } @else {
                        <button mat-menu-item (click)="activateConfig(config)">
                          <mat-icon>toggle_on</mat-icon>
                          <span>Activate</span>
                        </button>
                      }
                      <button mat-menu-item (click)="deleteConfig(config)" class="delete-action">
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>

            <!-- Mobile Cards -->
            <div class="mobile-cards">
              @for (config of configs(); track config.id) {
                <mat-card class="config-card">
                  <mat-card-header>
                    <mat-card-title>{{ config.chargeTypeDisplay }}</mat-card-title>
                    <mat-chip [class.active-chip]="config.isActive" [class.inactive-chip]="!config.isActive">
                      {{ config.isActive ? 'Active' : 'Inactive' }}
                    </mat-chip>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="config-detail">
                      <span class="label">Method:</span>
                      <span class="value">{{ formatCalculationMethod(config.calculationMethod) }}</span>
                    </div>
                    <div class="config-detail">
                      <span class="label">Formula:</span>
                      <span class="value formula-text">{{ config.calculationFormula }}</span>
                    </div>
                    <div class="config-detail">
                      <span class="label">Applies To:</span>
                      <div class="applies-to-chips">
                        @if (config.appliesToBuy) {
                          <mat-chip class="buy-chip">Buy</mat-chip>
                        }
                        @if (config.appliesToSell) {
                          <mat-chip class="sell-chip">Sell</mat-chip>
                        }
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-button (click)="openEditDialog(config)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    @if (config.isActive) {
                      <button mat-button (click)="deactivateConfig(config)">
                        <mat-icon>toggle_off</mat-icon>
                        Deactivate
                      </button>
                    } @else {
                      <button mat-button (click)="activateConfig(config)">
                        <mat-icon>toggle_on</mat-icon>
                        Activate
                      </button>
                    }
                    <button mat-button color="warn" (click)="deleteConfig(config)">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .charge-config-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .header h1 {
      flex: 1;
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .back-button {
      margin-right: 8px;
    }

    .configs-card {
      margin-top: 16px;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 48px 24px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #999;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 16px 0 8px;
      color: #666;
    }

    .empty-state p {
      color: #999;
      margin-bottom: 24px;
    }

    .desktop-table {
      display: none;
    }

    @media (min-width: 768px) {
      .desktop-table {
        display: block;
      }
      .mobile-cards {
        display: none;
      }
    }

    .configs-table {
      width: 100%;
    }

    .formula-text {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #555;
    }

    .applies-to-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .buy-chip {
      background-color: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .sell-chip {
      background-color: #fce4ec !important;
      color: #c2185b !important;
    }

    .active-chip {
      background-color: #c8e6c9 !important;
      color: #2e7d32 !important;
    }

    .inactive-chip {
      background-color: #ffecb3 !important;
      color: #f57c00 !important;
    }

    .delete-action {
      color: #f44336;
    }

    .mobile-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .config-card {
      margin-bottom: 0;
    }

    .config-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .config-detail {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      gap: 16px;
    }

    .config-detail .label {
      font-weight: 500;
      color: #666;
      min-width: 100px;
    }

    .config-detail .value {
      flex: 1;
      text-align: right;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
      padding: 8px 16px;
      flex-wrap: wrap;
    }
  `]
})
export class ChargeConfigPageComponent implements OnInit {
  configs = signal<ChargeConfig[]>([]);
  loading = signal(true);
  portfolioId: number = 0;
  displayedColumns = ['chargeType', 'calculationMethod', 'formula', 'appliesTo', 'status', 'actions'];

  constructor(
    private chargeConfigService: ChargeConfigService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.portfolioId = +params['portfolioId'] || 0;
      if (this.portfolioId) {
        this.loadConfigs();
      }
    });
  }

  loadConfigs(): void {
    this.loading.set(true);
    this.chargeConfigService.getChargeConfigs(this.portfolioId, false).subscribe({
      next: (configs) => {
        this.configs.set(configs);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading charge configurations:', error);
        this.snackBar.open('Error loading charge configurations', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateChargeConfigDialogComponent, {
      width: '600px',
      data: { portfolioId: this.portfolioId, config: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadConfigs();
      }
    });
  }

  openEditDialog(config: ChargeConfig): void {
    const dialogRef = this.dialog.open(CreateChargeConfigDialogComponent, {
      width: '600px',
      data: { portfolioId: this.portfolioId, config }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadConfigs();
      }
    });
  }

  activateConfig(config: ChargeConfig): void {
    this.chargeConfigService.activateChargeConfig(this.portfolioId, config.id).subscribe({
      next: () => {
        this.snackBar.open('Configuration activated successfully', 'Close', { duration: 3000 });
        this.loadConfigs();
      },
      error: (error) => {
        console.error('Error activating configuration:', error);
        this.snackBar.open(error.error?.message || 'Error activating configuration', 'Close', { duration: 5000 });
      }
    });
  }

  deactivateConfig(config: ChargeConfig): void {
    this.chargeConfigService.deactivateChargeConfig(this.portfolioId, config.id).subscribe({
      next: () => {
        this.snackBar.open('Configuration deactivated successfully', 'Close', { duration: 3000 });
        this.loadConfigs();
      },
      error: (error) => {
        console.error('Error deactivating configuration:', error);
        this.snackBar.open('Error deactivating configuration', 'Close', { duration: 3000 });
      }
    });
  }

  deleteConfig(config: ChargeConfig): void {
    if (confirm(`Are you sure you want to delete the ${config.chargeTypeDisplay} configuration?`)) {
      this.chargeConfigService.deleteChargeConfig(this.portfolioId, config.id).subscribe({
        next: () => {
          this.snackBar.open('Configuration deleted successfully', 'Close', { duration: 3000 });
          this.loadConfigs();
        },
        error: (error) => {
          console.error('Error deleting configuration:', error);
          this.snackBar.open('Error deleting configuration', 'Close', { duration: 3000 });
        }
      });
    }
  }

  formatCalculationMethod(method: string): string {
    const methodMap: { [key: string]: string } = {
      'ZERO_BROKERAGE': 'Zero Brokerage',
      'PERCENTAGE_ONLY': 'Percentage Only',
      'PERCENTAGE_WITH_MIN': 'Percentage with Minimum',
      'PERCENTAGE_WITH_MAX': 'Percentage with Maximum',
      'PERCENTAGE_WITH_MIN_MAX': 'Percentage with Min & Max',
      'FIXED_PER_TRANSACTION': 'Fixed per Transaction',
      'FIXED_PER_SCRIP': 'Fixed per Scrip'
    };
    return methodMap[method] || method;
  }

  goBack(): void {
    this.router.navigate(['/holdings'], { queryParams: { portfolioId: this.portfolioId } });
  }
}
