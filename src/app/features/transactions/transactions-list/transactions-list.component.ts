import { Component, OnInit, OnDestroy, AfterViewInit, Input, ViewChild, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { Subject, fromEvent, debounceTime, takeUntil } from 'rxjs';
import { Transaction, TransactionFilter, TransactionType, PaginationHeaders } from '../../../core/models/transaction.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { InvestmentService } from '../../../core/services/investment.service';
import { TransactionsViewService, TransactionsViewMode } from '../transactions-view.service';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss']
})
export class TransactionsListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() portfolioId?: number;
  @Input() viewType: 'user' | 'portfolio' = 'user';
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private readonly transactionService = inject(TransactionService);
  private readonly authService = inject(AuthService);
  private readonly investmentService = inject(InvestmentService);
  private readonly viewService = inject(TransactionsViewService);
  private readonly router = inject(Router);
  private destroy$ = new Subject<void>();

  transactions: Transaction[] = [];
  // Columns emphasize deltas and details
  displayedColumns: string[] = ['date', 'type', 'symbol', 'qty', 'units', 'nav', 'cash', 'net', 'description', 'expand'];

  // Expanded row state
  expandedElement: Transaction | null = null;

  // View mode is controlled by global toolbar
  viewMode: TransactionsViewMode = 'table';

  // Pagination
  currentPage = 0;
  pageSize = 20;
  hasMorePages = true;
  isLoading = false;
  isLoadingMore = false;

  // Filters
  filter: TransactionFilter = {
    page: 0,
    size: this.pageSize
  };

  transactionTypes = Object.values(TransactionType);
  selectedType?: TransactionType;
  selectedSymbol?: string;
  startDate?: Date;
  endDate?: Date;

  // User filter (for portfolio view)
  portfolioUsers: { id: number; name: string }[] = [];
  selectedUserId?: number;

  // Pagination info
  totalCount = 0;
  totalPages = 0;

  ngOnInit(): void {
    // Load users for portfolio filter if applicable
    if (this.viewType === 'portfolio' && this.portfolioId) {
      this.loadPortfolioUsers();
    }
    // Subscribe to view mode from toolbar controls
    this.viewService.viewMode$.pipe(takeUntil(this.destroy$)).subscribe(mode => (this.viewMode = mode));

    this.loadTransactions();
  }

  ngAfterViewInit(): void {
    // Setup infinite scroll after view is initialized
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Row expand/collapse
  toggleExpand(row: Transaction): void {
    this.expandedElement = this.expandedElement === row ? null : row;
  }

  // View mode changes are handled by toolbar controls via TransactionsViewService

  // Navigate back to portfolio details when in portfolio view
  goBackToPortfolio(): void {
    if (this.viewType === 'portfolio' && this.portfolioId) {
      this.router.navigate(['/portfolios', this.portfolioId]);
    }
  }

  private setupInfiniteScroll(): void {
    // Wait for view to initialize and ensure scrollContainer is available
    setTimeout(() => {
      if (this.scrollContainer?.nativeElement) {
        const scrollElement = this.scrollContainer.nativeElement;

        fromEvent(scrollElement, 'scroll')
          .pipe(
            debounceTime(200),
            takeUntil(this.destroy$)
          )
          .subscribe(() => {
            this.checkScrollPosition(scrollElement);
          });
      } else {
        console.warn('Scroll container not found, retrying...');
        // Retry after a longer delay if container is not ready
        setTimeout(() => this.setupInfiniteScroll(), 500);
      }
    }, 100);
  }

  private checkScrollPosition(scrollElement: HTMLElement): void {
    const scrollTop = scrollElement.scrollTop;
    const scrollHeight = scrollElement.scrollHeight;
    const clientHeight = scrollElement.clientHeight;

    // Calculate how close to bottom we are (in percentage)
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Check if we should load more when near bottom

    // Load more when user scrolls to 90% of the content
    if (scrollPercentage >= 0.9) {
      if (this.hasMorePages && !this.isLoadingMore && !this.isLoading) {
        this.loadMoreTransactions();
      }
    }
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.currentPage = 0;
    this.filter.page = 0;
    this.transactions = [];

    this.fetchTransactions().subscribe({
      next: (response) => {
        this.transactions = response.transactions;
        this.updatePaginationInfo(response.pagination);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      }
    });
  }

  private loadMoreTransactions(): void {
    if (this.isLoadingMore) {
      return;
    }

    if (!this.hasMorePages) {
      // Try to load anyway to test if backend has more data
      // This helps handle cases where pagination info might be inconsistent
    }
    this.isLoadingMore = true;
    this.currentPage++;
    this.filter.page = this.currentPage;

    this.fetchTransactions().subscribe({
      next: (response) => {
        if (response.transactions.length > 0) {
          this.transactions = [...this.transactions, ...response.transactions];
          this.updatePaginationInfo(response.pagination);
        } else {
          this.currentPage--; // Revert page increment if no data
          this.filter.page = this.currentPage;
          this.hasMorePages = false;
        }
        this.isLoadingMore = false;
      },
      error: (error) => {
        console.error('Error loading more transactions:', error);
        this.currentPage--; // Revert page increment on error
        this.filter.page = this.currentPage;
        this.isLoadingMore = false;
      }
    });
  }

  private fetchTransactions() {
    if (this.viewType === 'portfolio' && this.portfolioId) {
      // If a specific user is selected, fetch that user's transactions filtered by this portfolio
      if (this.selectedUserId) {
        const userFilter: TransactionFilter = { ...this.filter, portfolioId: this.portfolioId };
        return this.transactionService.getUserTransactions(this.selectedUserId, userFilter);
      }
      return this.transactionService.getPortfolioTransactions(this.portfolioId, this.filter);
    } else {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        // If viewing user transactions but with a specific portfolio filter
        if (this.portfolioId) {
          this.filter.portfolioId = this.portfolioId;
        }
        return this.transactionService.getUserTransactions(userId, this.filter);
      }
      throw new Error('User ID not found');
    }
  }

  private updatePaginationInfo(pagination: PaginationHeaders): void {
    this.totalCount = pagination.totalCount;
    this.totalPages = pagination.totalPages;
    this.hasMorePages = pagination.hasNext;
  }

  // Group transactions by day for timeline view
  get timelineGroups(): { dateLabel: string; items: Transaction[] }[] {
    const groups = new Map<string, Transaction[]>();
    for (const t of this.transactions) {
      const d = new Date(t.createdAt);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(t);
    }
    // Sort keys descending (newest first)
    const sortedKeys = Array.from(groups.keys()).sort((a, b) => (a < b ? 1 : -1));
    return sortedKeys.map((k) => {
      const date = new Date(k);
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const items = groups.get(k)!.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      return { dateLabel: label, items };
    });
  }

  applyFilters(): void {
    // Reset pagination
    this.currentPage = 0;
    this.filter.page = 0;

    // Apply filter values
    this.filter.type = this.selectedType;
    this.filter.symbol = this.selectedSymbol;
    this.filter.startDate = this.startDate?.toISOString();
    this.filter.endDate = this.endDate?.toISOString();
    // Ensure portfolioId is preserved when needed
    if (this.viewType === 'portfolio' && this.portfolioId) {
      this.filter.portfolioId = this.selectedUserId ? this.portfolioId : undefined;
    }

    this.loadTransactions();
  }

  clearFilters(): void {
    this.selectedType = undefined;
    this.selectedSymbol = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    // Do not clear selectedUserId here so user filter persists unless explicitly changed

    this.filter = {
      page: 0,
      size: this.pageSize
    };

    if (this.portfolioId && this.viewType === 'user') {
      this.filter.portfolioId = this.portfolioId;
    }

    this.loadTransactions();
  }

  getTransactionTypeColor(type: TransactionType): string {
    const t = String(type);
    switch (t) {
      case TransactionType.BUY:
      case 'BUY_SHARES':
      case 'CASH_ADDITION':
      case 'USER_INVESTMENT':
      case TransactionType.INVESTMENT:
        return 'primary';
      case TransactionType.SELL:
      case 'SELL_SHARES':
      case TransactionType.WITHDRAWAL:
        return 'accent';
      case TransactionType.DIVIDEND:
        return 'accent';
      case TransactionType.FEE:
      case 'FEE_DEDUCTION':
        return 'warn';
      case 'NAV_UPDATE':
        return '';
      default:
        return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ----- Delta helpers -----
  private numOrNull(v: any): number | null {
    return (v === null || v === undefined || v === '') ? null : Number(v);
  }

  unitsDelta(t: any): number | null {
    const before = this.numOrNull(t?.unitsBefore);
    const after = this.numOrNull(t?.unitsAfter);
    if (before !== null && after !== null) return after - before;
    const qty = this.numOrNull(t?.quantity ?? t?.units);
    if (qty === null) return null;
    const type = String(t?.transactionType || '');
    if (['BUY', 'INVESTMENT', 'USER_INVESTMENT', 'DIVIDEND'].includes(type)) return qty;
    if (['SELL', 'WITHDRAWAL', 'FEE', 'FEE_DEDUCTION'].includes(type)) return -qty;
    return qty;
  }

  navDelta(t: any): number | null {
    const before = this.numOrNull(t?.navBefore ?? t?.navValue);
    const after = this.numOrNull(t?.navAfter ?? t?.navValue);
    if (before !== null && after !== null) return after - before;
    return null;
  }

  hasCash(t: any): boolean {
    const before = this.numOrNull(t?.remainingCashBefore);
    const after = this.numOrNull(t?.remainingCashAfter);
    return before !== null && after !== null;
  }

  cashDelta(t: any): number | null {
    const before = this.numOrNull(t?.remainingCashBefore);
    const after = this.numOrNull(t?.remainingCashAfter);
    if (before !== null && after !== null) return after - before;
    return null;
  }

  deltaClass(val: number | null): string {
    if (val === null) return 'delta-neutral';
    if (val > 0) return 'delta-pos';
    if (val < 0) return 'delta-neg';
    return 'delta-neutral';
  }

  bestAmount(t: any): number | null {
    const net = this.numOrNull(t?.netAmount);
    if (net !== null) return net;
    const total = this.numOrNull(t?.totalAmount);
    return total;
  }

  bestAmountClass(val: number | null | undefined): string {
    const n = this.numOrNull(val);
    if (n === null) return 'amount-neutral';
    if (n > 0) return 'amount-pos';
    if (n < 0) return 'amount-neg';
    return 'amount-neutral';
  }

  // Back-compat with template binding
  amountClass(val: number | null | undefined): string {
    return this.bestAmountClass(val);
  }

  typeIcon(type: any): string {
    switch (String(type)) {
      case 'BUY':
      case 'BUY_SHARES':
      case 'CASH_ADDITION':
      case 'INVESTMENT':
      case 'USER_INVESTMENT':
        return 'trending_up';
      case 'SELL':
      case 'SELL_SHARES':
      case 'WITHDRAWAL':
        return 'trending_down';
      case 'DIVIDEND':
        return 'payments';
      case 'FEE':
      case 'FEE_DEDUCTION':
        return 'receipt_long';
      case 'NAV_UPDATE':
        return 'insights';
      default:
        return 'receipt';
    }
  }

  // Trade helpers
  isTradeType(type: any): boolean {
    const t = String(type);
    return t === 'BUY' || t === 'SELL' || t === 'BUY_SHARES' || t === 'SELL_SHARES';
  }

  getDisplayQuantity(t: any): number | null {
    return this.isTradeType(t?.transactionType) ? (this.numOrNull(t?.quantity) ?? null) : null;
  }

  fmtNumber(val: any, format: string = '1.2-2'): string {
    const n = this.numOrNull(val);
    return n === null ? '—' : new Intl.NumberFormat('en-US', {
      minimumIntegerDigits: 1,
      minimumFractionDigits: Number((format.split('-')[0].split('.')[1]) || 0),
      maximumFractionDigits: Number((format.split('-')[1]) || 2)
    }).format(n);
  }

  fmtCurrency(val: any, currency: string = 'INR'): string {
    const n = this.numOrNull(val);
    return n === null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
  }

  private loadPortfolioUsers(): void {
    if (!this.portfolioId) return;
    this.investmentService.getPortfolioInvestments(this.portfolioId).subscribe({
      next: (response) => {
        if (response?.success && Array.isArray(response.data)) {
          // Map unique users from investments
          const seen = new Set<number>();
          this.portfolioUsers = response.data
            .map((inv: any) => inv.user)
            .filter((u: any) => u && typeof u.id === 'number' && !seen.has(u.id) && (seen.add(u.id) || true))
            .map((u: any) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`.trim() }));
        }
      },
      error: (err) => {
        // Silently ignore; user filter is optional
        console.error('Failed to load portfolio users', err);
      }
    });
  }
}
