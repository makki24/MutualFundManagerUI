import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { StockService } from '../../../core/services/stock.service';
import { Stock } from '../../../core/models/stock.model';

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <mat-form-field appearance="outline" class="stock-search-field">
      <mat-label>{{ placeholder }}</mat-label>
      <input
        matInput
        [formControl]="searchControl"
        [matAutocomplete]="auto"
        [placeholder]="placeholder"
      />
      <mat-icon matSuffix>search</mat-icon>
      @if (isLoading) {
        <mat-spinner matSuffix diameter="20"></mat-spinner>
      }
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn" (optionSelected)="onStockSelected($event)">
        @for (stock of filteredStocks$ | async; track stock.id) {
          <mat-option [value]="stock">
            <div class="stock-option">
              <div class="stock-primary">
                <span class="stock-symbol">{{ stock.primarySymbol }}</span>
                <span class="stock-name">{{ stock.displayName }}</span>
              </div>
              <div class="stock-secondary">
                <span class="stock-industry">{{ stock.industry }}</span>
                <span class="stock-sector">{{ stock.sector }}</span>
              </div>
            </div>
          </mat-option>
        }
        @if ((filteredStocks$ | async)?.length === 0 && searchControl.value && !isLoading) {
          <mat-option disabled>
            <div class="no-results">
              <mat-icon>search_off</mat-icon>
              <span>No stocks found</span>
            </div>
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`
    .stock-search-field {
      width: 100%;
      min-width: 300px;
    }

    .stock-option {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 4px 0;
    }

    .stock-primary {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stock-symbol {
      font-weight: 600;
      color: #1976d2;
      min-width: 80px;
    }

    .stock-name {
      font-size: 14px;
      color: #333;
    }

    .stock-secondary {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #666;
      margin-left: 92px;
    }

    .stock-industry {
      padding: 2px 8px;
      background-color: #e3f2fd;
      border-radius: 12px;
      font-size: 11px;
    }

    .stock-sector {
      padding: 2px 8px;
      background-color: #f3e5f5;
      border-radius: 12px;
      font-size: 11px;
    }

    .no-results {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-style: italic;
    }

    .no-results mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    ::ng-deep .mat-mdc-option {
      min-height: 60px !important;
    }
  `]
})
export class StockSearchComponent implements OnInit {
  @Input() placeholder = 'Search stocks...';
  @Input() disabled = false;
  @Output() stockSelected = new EventEmitter<Stock>();

  private stockService = inject(StockService);

  searchControl = new FormControl('');
  filteredStocks$!: Observable<Stock[]>;
  isLoading = false;

  ngOnInit(): void {
    this.filteredStocks$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.trim().length >= 2) {
          this.isLoading = true;
          return this.stockService.searchStocks(value.trim()).pipe(
            switchMap(response => {
              this.isLoading = false;
              return of(response.success ? response.data || [] : []);
            }),
            catchError(() => {
              this.isLoading = false;
              return of([]);
            })
          );
        } else {
          this.isLoading = false;
          return of([]);
        }
      })
    );
  }

  displayFn(stock: Stock): string {
    return stock ? `${stock.primarySymbol} - ${stock.displayName}` : '';
  }

  onStockSelected(event: any): void {
    const stock = event.option.value as Stock;
    if (stock) {
      this.stockSelected.emit(stock);
    }
  }

  clearSelection(): void {
    this.searchControl.setValue('');
  }
}
