import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subject, takeUntil } from 'rxjs';
import { NavHistoryItem } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-nav-history-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonToggleModule,
    BaseChartDirective
  ],
  template: `
    <mat-card class="nav-chart-card">
      <mat-card-header>
        <mat-card-subtitle>
          @if (navHistory && navHistory.length > 0) {
            <div class="nav-header-container">
              <span class="nav-current">
                Current NAV: <strong>{{ getCurrentNav() | currency:'INR':'symbol':'1.4-4' }}</strong>
                @if (units > 0) {
                  <span class="units-info"> • {{ units | number:'1.2-2' }} units</span>
                }
              </span>
              <span class="nav-change" [class.positive]="getOverallChange() >= 0" [class.negative]="getOverallChange() < 0">
                {{ getOverallChange() >= 0 ? '+' : '' }}{{ getOverallChangePercentage() | number:'1.2-2' }}%
              </span>
            </div>
          }
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="chart-controls">
          <mat-button-toggle-group [(value)]="selectedPeriod" (change)="onPeriodChange($event)">
            <mat-button-toggle value="1W">1W</mat-button-toggle>
            <mat-button-toggle value="1M">1M</mat-button-toggle>
            <mat-button-toggle value="3M">3M</mat-button-toggle>
            <mat-button-toggle value="6M">6M</mat-button-toggle>
            <mat-button-toggle value="1Y">1Y</mat-button-toggle>
            <mat-button-toggle value="ALL">ALL</mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        @if (isLoading || internalLoading) {
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading NAV history...</p>
          </div>
        } @else if (navHistory && navHistory.length > 0) {
          <div class="chart-container">
            <canvas baseChart
              [data]="chartData"
              [options]="chartOptions"
              [type]="chartType"
              [legend]="chartLegend">
            </canvas>
          </div>

          <div class="chart-stats">
            <div class="high-low-container">
              <div class="stat-side">
                <span class="stat-label">{{ selectedPeriod }} Low</span>
                <span class="stat-value">{{ getLowestNav() | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
              <div class="range-line">
                <div class="range-bar"></div>
                <div class="range-indicator"></div>
              </div>
              <div class="stat-side">
                <span class="stat-label">{{ selectedPeriod }} High</span>
                <span class="stat-value">{{ getHighestNav() | currency:'INR':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>

        } @else {
          <div class="no-data">
            <mat-icon>show_chart</mat-icon>
            <p>No NAV history available</p>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .nav-chart-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    mat-card-header {
      padding: 16px 16px 8px;
    }

    mat-card-subtitle {
      margin-top: 8px;
    }

    .nav-header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 16px;
    }

    .nav-current {
      font-size: 14px;
      color: #666;
    }

    .nav-current strong {
      color: #333;
      font-weight: 600;
    }

    .units-info {
      color: #666;
      font-size: 12px;
      font-weight: 400;
      margin-left: 4px;
    }

    .nav-change {
      font-size: 16px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .nav-change.positive {
      color: #4caf50;
      background: rgba(76, 175, 80, 0.1);
    }

    .nav-change.negative {
      color: #f44336;
      background: rgba(244, 67, 54, 0.1);
    }

    mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 16px;
    }

    .chart-controls {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .chart-controls mat-button-toggle-group {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .chart-container {
      position: relative;
      height: 300px;
      margin-bottom: 20px;
    }

    .chart-stats {
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .high-low-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      width: 100%;
    }

    .stat-side {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 0 0 auto;
      min-width: 80px;
    }

    .stat-side:first-child {
      align-items: flex-start;
      text-align: left;
    }

    .stat-side:last-child {
      align-items: flex-end;
      text-align: right;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .range-line {
      flex: 1;
      margin: 0 16px;
      position: relative;
      height: 4px;
    }

    .range-bar {
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #4caf50 0%, #2196f3 100%);
      border-radius: 2px;
    }

    .range-indicator {
      position: absolute;
      top: 50%;
      right: 20%;
      width: 8px;
      height: 8px;
      background: #2196f3;
      border-radius: 50%;
      transform: translateY(-50%);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .transaction-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .transaction-chips mat-chip {
      font-size: 12px;
    }

    .chip-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .chip-user-investment {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .chip-nav-update {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    .chip-buy {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .chip-sell {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .chip-withdrawal {
      background: rgba(255, 152, 0, 0.1);
      color: #ff9800;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.3;
    }

    @media (max-width: 768px) {
      .chart-container {
        height: 250px;
      }

      .chart-controls mat-button-toggle-group {
        width: 100%;
      }

      .nav-header-container {
        gap: 8px;
      }

      .high-low-container {
        flex-direction: row;
        gap: 0;
      }

      .range-line {
        flex: 1;
        margin: 0 12px;
      }

      .stat-side {
        min-width: 60px;
      }

      .stat-side:first-child {
        align-items: flex-start;
        text-align: left;
      }

      .stat-side:last-child {
        align-items: flex-end;
        text-align: right;
      }
    }

    @media (max-width: 480px) {
      .chart-container {
        height: 200px;
      }

      .chart-stats {
        padding: 12px;
      }

      .stat-label {
        font-size: 11px;
      }

      .stat-value {
        font-size: 14px;
      }

      .range-line {
        margin: 8px 0;
      }
    }
  `]
})
export class NavHistoryChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() navHistory: NavHistoryItem[] = [];
  @Input() portfolioId?: number;
  @Input() isLoading = false;
  @Input() units: number = 0;

  selectedPeriod = '1Y';
  filteredHistory: NavHistoryItem[] = [];
  internalLoading = false;
  private destroy$ = new Subject<void>();

  constructor(private dashboardService: DashboardService) {}

  // Chart configuration
  chartType: 'line' = 'line';
  chartLegend = false;
  chartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: (tooltipItems) => {
            const date = new Date(tooltipItems[0].label || '');
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          },
          label: (context) => {
            const value = context.parsed.y;
            const dataIndex = context.dataIndex;
            const item = this.filteredHistory[dataIndex];
            const lines = [
              `NAV: ₹${value.toFixed(4)}`,
            ];
            if (item) {
              if (item.changeAmount !== 0) {
                const change = item.changeAmount >= 0 ? '+' : '';
                lines.push(`Change: ${change}${item.changeAmount.toFixed(4)} (${change}${item.changePercentage.toFixed(2)}%)`);
              }
              if (item.description) {
                lines.push(`Event: ${item.description}`);
              }
            }
            return lines;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 6,
          callback: function(value, index) {
            const date = new Date(this.getLabelForValue(index));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
        }
      },
      y: {
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return '₹' + (value as number).toFixed(2);
          }
        }
      }
    }
  };

  ngOnInit(): void {
    this.filterDataByPeriod();
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['navHistory']) {
      this.filterDataByPeriod();
      this.updateChart();
    }
  }

  onPeriodChange(event?: any): void {
    // Update selectedPeriod from the event if provided
    if (event && event.value) {
      this.selectedPeriod = event.value;
    }

    console.log('onPeriodChange called:', {
      selectedPeriod: this.selectedPeriod,
      portfolioId: this.portfolioId,
      hasPortfolioId: !!this.portfolioId,
      eventValue: event?.value
    });

    if (this.portfolioId) {
      console.log('Calling loadNavHistoryForPeriod...');
      this.loadNavHistoryForPeriod();
    } else {
      console.log('Calling filterDataByPeriod...');
      this.filterDataByPeriod();
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNavHistoryForPeriod(): void {
    if (!this.portfolioId) return;

    this.internalLoading = true;
    const { startDate, endDate } = this.getDateRangeForPeriod();

    const startDateStr = startDate ? startDate.toISOString().split('T')[0] : undefined;
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Loading NAV history for period ${this.selectedPeriod}:`, {
      portfolioId: this.portfolioId,
      startDate: startDateStr,
      endDate: endDateStr,
      startDateObj: startDate,
      endDateObj: endDate
    });

    this.dashboardService.getNavHistory(
      this.portfolioId,
      startDateStr,
      endDateStr
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log(`NAV history response for ${this.selectedPeriod}:`, response);
          this.navHistory = response.data || [];
          this.filteredHistory = [...this.navHistory];
          this.updateChart();
          this.internalLoading = false;
        },
        error: (error) => {
          console.error('Failed to load NAV history for period:', error);
          this.navHistory = [];
          this.filteredHistory = [];
          this.updateChart();
          this.internalLoading = false;
        }
      });
  }

  private getDateRangeForPeriod(): { startDate: Date | null, endDate: Date } {
    const endDate = new Date();
    let startDate: Date | null = null;

    switch (this.selectedPeriod) {
      case '1W':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1M':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6M':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1Y':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'ALL':
        startDate = null; // No start date for ALL
        break;
    }

    return { startDate, endDate };
  }

  private filterDataByPeriod(): void {
    if (!this.navHistory || this.navHistory.length === 0) {
      this.filteredHistory = [];
      return;
    }

    const { startDate } = this.getDateRangeForPeriod();

    if (startDate) {
      this.filteredHistory = this.navHistory.filter(item =>
        new Date(item.timestamp) >= startDate
      );
    } else {
      this.filteredHistory = [...this.navHistory];
    }

    // Sort by timestamp
    this.filteredHistory.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  private updateChart(): void {
    if (!this.filteredHistory || this.filteredHistory.length === 0) {
      this.chartData = {
        labels: [],
        datasets: []
      };
      return;
    }

    const labels = this.filteredHistory.map(item => item.timestamp);
    const data = this.filteredHistory.map(item => item.navValue);

    // Create gradient
    const gradient = this.createGradient(data);

    this.chartData = {
      labels,
      datasets: [{
        data,
        borderColor: gradient.borderColor,
        backgroundColor: gradient.backgroundColor,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: gradient.borderColor,
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    };
  }

  private createGradient(data: number[]): { borderColor: string, backgroundColor: string } {
    const isPositive = data.length > 1 && data[data.length - 1] >= data[0];

    return {
      borderColor: isPositive ? '#4caf50' : '#f44336',
      backgroundColor: isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
    };
  }

  getCurrentNav(): number {
    if (!this.navHistory || this.navHistory.length === 0) return 0;
    return this.navHistory[this.navHistory.length - 1].navValue;
  }

  getOverallChange(): number {
    if (!this.filteredHistory || this.filteredHistory.length < 2) return 0;
    const first = this.filteredHistory[0].navValue;
    const last = this.filteredHistory[this.filteredHistory.length - 1].navValue;
    return last - first;
  }

  getOverallChangePercentage(): number {
    if (!this.filteredHistory || this.filteredHistory.length < 2) return 0;
    const first = this.filteredHistory[0].navValue;
    const last = this.filteredHistory[this.filteredHistory.length - 1].navValue;
    return ((last - first) / first) * 100;
  }

  getHighestNav(): number {
    if (!this.filteredHistory || this.filteredHistory.length === 0) return 0;
    return Math.max(...this.filteredHistory.map(item => item.navValue));
  }

  getLowestNav(): number {
    if (!this.filteredHistory || this.filteredHistory.length === 0) return 0;
    return Math.min(...this.filteredHistory.map(item => item.navValue));
  }

  getAverageNav(): number {
    if (!this.filteredHistory || this.filteredHistory.length === 0) return 0;
    const sum = this.filteredHistory.reduce((acc, item) => acc + item.navValue, 0);
    return sum / this.filteredHistory.length;
  }

  getTransactionTypes(): string[] {
    if (!this.filteredHistory) return [];
    const types = new Set(this.filteredHistory.map(item => item.transactionType));
    return Array.from(types);
  }

  getTransactionIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'USER_INVESTMENT': 'account_balance',
      'NAV_UPDATE': 'trending_up',
      'BUY': 'add_circle',
      'SELL': 'remove_circle',
      'WITHDRAWAL': 'money_off'
    };
    return iconMap[type] || 'info';
  }

  formatTransactionType(type: string): string {
    return type.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}
