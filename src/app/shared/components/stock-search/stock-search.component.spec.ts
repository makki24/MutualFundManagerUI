import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { StockSearchComponent } from './stock-search.component';
import { StockService } from '../../../core/services/stock.service';
import { Stock } from '../../../core/models/stock.model';
import { ApiResponse } from '../../../core/models/api-response.model';

describe('StockSearchComponent', () => {
  let component: StockSearchComponent;
  let fixture: ComponentFixture<StockSearchComponent>;
  let mockStockService: jasmine.SpyObj<StockService>;

  const mockStocks: Stock[] = [
    {
      id: '1',
      companyName: 'Reliance Industries Limited',
      industry: 'Oil & Gas',
      sector: 'Energy',
      stockType: 'Equity',
      bseCode: '500325',
      nseCode: 'RELIANCE',
      bseSymbol: 'RELIANCE',
      nseSymbol: 'RELIANCE',
      primarySymbol: 'RELIANCE',
      displayName: 'Reliance Industries Limited'
    },
    {
      id: '2',
      companyName: 'Tata Consultancy Services Limited',
      industry: 'Information Technology',
      sector: 'Technology',
      stockType: 'Equity',
      bseCode: '532540',
      nseCode: 'TCS',
      bseSymbol: 'TCS',
      nseSymbol: 'TCS',
      primarySymbol: 'TCS',
      displayName: 'Tata Consultancy Services Limited'
    }
  ];

  beforeEach(async () => {
    const stockServiceSpy = jasmine.createSpyObj('StockService', ['searchStocks']);

    await TestBed.configureTestingModule({
      imports: [StockSearchComponent, NoopAnimationsModule],
      providers: [
        { provide: StockService, useValue: stockServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StockSearchComponent);
    component = fixture.componentInstance;
    mockStockService = TestBed.inject(StockService) as jasmine.SpyObj<StockService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default placeholder', () => {
    expect(component.placeholder).toBe('Search stocks...');
  });

  it('should accept custom placeholder', () => {
    component.placeholder = 'Find stocks...';
    expect(component.placeholder).toBe('Find stocks...');
  });

  it('should search stocks when input length >= 2', fakeAsync(() => {
    const mockResponse: ApiResponse<Stock[]> = {
      success: true,
      message: 'Stocks retrieved successfully',
      data: mockStocks,
      timestamp: '2025-08-06T16:30:00',
      error: null
    };

    mockStockService.searchStocks.and.returnValue(of(mockResponse));

    component.ngOnInit();
    component.searchControl.setValue('REL');
    tick(300); // Wait for debounce

    expect(mockStockService.searchStocks).toHaveBeenCalledWith('REL');

    component.filteredStocks$.subscribe(stocks => {
      expect(stocks).toEqual(mockStocks);
    });
  }));

  it('should not search when input length < 2', fakeAsync(() => {
    component.ngOnInit();
    component.searchControl.setValue('R');
    tick(300);

    expect(mockStockService.searchStocks).not.toHaveBeenCalled();

    component.filteredStocks$.subscribe(stocks => {
      expect(stocks).toEqual([]);
    });
  }));

  it('should handle search errors gracefully', fakeAsync(() => {
    mockStockService.searchStocks.and.returnValue(throwError(() => new Error('API Error')));

    component.ngOnInit();
    component.searchControl.setValue('REL');
    tick(300);

    expect(mockStockService.searchStocks).toHaveBeenCalledWith('REL');
    expect(component.isLoading).toBeFalse();

    component.filteredStocks$.subscribe(stocks => {
      expect(stocks).toEqual([]);
    });
  }));

  it('should emit stockSelected when stock is selected', () => {
    spyOn(component.stockSelected, 'emit');

    const mockEvent = {
      option: {
        value: mockStocks[0]
      }
    };

    component.onStockSelected(mockEvent);

    expect(component.stockSelected.emit).toHaveBeenCalledWith(mockStocks[0]);
  });

  it('should display stock correctly', () => {
    const result = component.displayFn(mockStocks[0]);
    expect(result).toBe('RELIANCE - Reliance Industries Limited');
  });

  it('should return empty string for null stock in displayFn', () => {
    const result = component.displayFn(null as any);
    expect(result).toBe('');
  });

  it('should clear selection', () => {
    component.searchControl.setValue('test');
    component.clearSelection();
    expect(component.searchControl.value).toBe('');
  });

  it('should set loading state during search', fakeAsync(() => {
    const mockResponse: ApiResponse<Stock[]> = {
      success: true,
      message: 'Stocks retrieved successfully',
      data: mockStocks,
      timestamp: '2025-08-06T16:30:00',
      error: null
    };

    mockStockService.searchStocks.and.returnValue(of(mockResponse));

    component.ngOnInit();
    expect(component.isLoading).toBeFalse();

    component.searchControl.setValue('REL');
    tick(300);

    expect(component.isLoading).toBeFalse(); // Should be false after successful response
  }));

  it('should handle unsuccessful API response', fakeAsync(() => {
    const mockResponse: ApiResponse<Stock[]> = {
      success: false,
      message: 'No stocks found',
      data: null,
      timestamp: '2025-08-06T16:30:00',
      error: 'Not found'
    };

    mockStockService.searchStocks.and.returnValue(of(mockResponse));

    component.ngOnInit();
    component.searchControl.setValue('INVALID');
    tick(300);

    component.filteredStocks$.subscribe(stocks => {
      expect(stocks).toEqual([]);
    });
  }));
});
