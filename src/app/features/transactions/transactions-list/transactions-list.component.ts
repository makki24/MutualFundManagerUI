import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, inject } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { Subject, fromEvent, debounceTime, takeUntil } from 'rxjs';
import { Transaction, TransactionFilter, TransactionType, PaginationHeaders } from '../../../core/models/transaction.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';

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
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    FormsModule
  ],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss']
})
export class TransactionsListComponent implements OnInit, OnDestroy {
  @Input() portfolioId?: number;
  @Input() viewType: 'user' | 'portfolio' = 'user';
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private readonly transactionService = inject(TransactionService);
  private readonly authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  transactions: Transaction[] = [];
  displayedColumns: string[] = ['date', 'type', 'symbol', 'quantity', 'price', 'amount', 'portfolio'];
  
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

  // Pagination info
  totalCount = 0;
  totalPages = 0;

  ngOnInit(): void {
    // If viewing portfolio transactions, remove portfolio column
    if (this.viewType === 'portfolio' && this.portfolioId) {
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'portfolio');
    }
    
    this.loadTransactions();
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupInfiniteScroll(): void {
    // Wait for view to initialize
    setTimeout(() => {
      if (this.scrollContainer) {
        const scrollElement = this.scrollContainer.nativeElement;
        
        fromEvent(scrollElement, 'scroll')
          .pipe(
            debounceTime(200),
            takeUntil(this.destroy$)
          )
          .subscribe(() => {
            const scrollTop = scrollElement.scrollTop;
            const scrollHeight = scrollElement.scrollHeight;
            const clientHeight = scrollElement.clientHeight;
            
            // Load more when user scrolls to bottom (with 100px threshold)
            if (scrollTop + clientHeight >= scrollHeight - 100) {
              if (this.hasMorePages && !this.isLoadingMore) {
                this.loadMoreTransactions();
              }
            }
          });
      }
    }, 100);
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
    if (!this.hasMorePages || this.isLoadingMore) {
      return;
    }
    
    this.isLoadingMore = true;
    this.currentPage++;
    this.filter.page = this.currentPage;
    
    this.fetchTransactions().subscribe({
      next: (response) => {
        this.transactions = [...this.transactions, ...response.transactions];
        this.updatePaginationInfo(response.pagination);
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

  applyFilters(): void {
    // Reset pagination
    this.currentPage = 0;
    this.filter.page = 0;
    
    // Apply filter values
    this.filter.type = this.selectedType;
    this.filter.symbol = this.selectedSymbol;
    this.filter.startDate = this.startDate?.toISOString();
    this.filter.endDate = this.endDate?.toISOString();
    
    this.loadTransactions();
  }

  clearFilters(): void {
    this.selectedType = undefined;
    this.selectedSymbol = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    
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
    switch (type) {
      case TransactionType.BUY:
        return 'primary';
      case TransactionType.SELL:
        return 'accent';
      case TransactionType.DIVIDEND:
        return 'success';
      case TransactionType.FEE:
        return 'warn';
      case TransactionType.INVESTMENT:
        return 'primary';
      case TransactionType.WITHDRAWAL:
        return 'warn';
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
}
