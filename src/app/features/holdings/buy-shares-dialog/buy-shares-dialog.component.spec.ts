import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { BuySharesDialogComponent, BuySharesDialogData } from './buy-shares-dialog.component';
import { StockService } from '../../../core/services/stock.service';
import { Stock, StockPrice, BuySharesResponse } from '../../../core/models/stock.model';
import { ApiResponse } from '../../../core/models/api-response.model';

describe('BuySharesDialogComponent', () => {
  let component: BuySharesDialogComponent;
  let fixture: ComponentFixture<BuySharesDialogComponent>;
  let mockStockService: jasmine.SpyObj<StockService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<BuySharesDialogComponent>>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockDialogData: BuySharesDialogData = {
    portfolioId: 1,
    portfolioName: 'Test Portfolio'
  };

  const mockStock: Stock = {
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
  };

  const mockStockPrice: StockPrice = {
    tickerId: 'RELIANCE',
    companyName: 'Reliance Industries Limited',
    industry: 'Oil & Gas',
    currentPrice: {
      bsePrice: '2501.00',
      nsePrice: '2500.75'
    },
    percentChange: 1.25,
    yearHigh: 2856.15,
    yearLow: 2220.30,
    primaryPrice: 2500.75
  };

  beforeEach(async () => {
    const stockServiceSpy = jasmine.createSpyObj('StockService', ['getStockPrice', 'buyShares', 'buyMoreShares']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [BuySharesDialogComponent, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: StockService, useValue: stockServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BuySharesDialogComponent);
    component = fixture.componentInstance;
    mockStockService = TestBed.inject(StockService) as jasmine.SpyObj<StockService>;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<BuySharesDialogComponent>>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    component.ngOnInit();

    expect(component.buyForm.get('quantity')?.value).toBe(1);
    expect(component.buyForm.get('price')?.value).toBe(0);
    expect(component.buyForm.get('additionalCharges')?.value).toBe(0);
    expect(component.buyForm.get('description')?.value).toBe('');
  });

  it('should initialize with existing holding price when provided', () => {
    // Manually set the data to simulate existing holding
    component.data = {
      portfolioId: 1,
      portfolioName: 'Test Portfolio',
      existingHolding: {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        currentPrice: 2500.00
      }
    };

    component.ngOnInit();

    expect(component.buyForm.get('price')?.value).toBe(2500.00);
  });

  it('should load stock price when stock is selected', () => {
    const mockResponse: ApiResponse<StockPrice> = {
      success: true,
      message: 'Stock price retrieved successfully',
      data: mockStockPrice,
      timestamp: '2025-08-06T16:30:00',
      error: null
    };

    mockStockService.getStockPrice.and.returnValue(of(mockResponse));

    component.onStockSelected(mockStock);

    expect(component.selectedStock).toBe(mockStock);
    expect(mockStockService.getStockPrice).toHaveBeenCalledWith('RELIANCE');
    expect(component.currentPrice).toBe(mockStockPrice);
    expect(component.buyForm.get('price')?.value).toBe(2500.75);
  });

  it('should handle stock price loading error', () => {
    spyOn(console, 'error');
    mockStockService.getStockPrice.and.returnValue(throwError(() => new Error('API Error')));

    component.onStockSelected(mockStock);

    expect(component.loadingPrice).toBeFalse();
    expect(component.currentPrice).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Failed to load stock price:', jasmine.any(Error));
  });

  it('should calculate subtotal correctly', () => {
    component.buyForm.patchValue({
      quantity: 10,
      price: 2500
    });

    expect(component.getSubtotal()).toBe(25000);
  });

  it('should calculate total amount correctly', () => {
    component.buyForm.patchValue({
      quantity: 10,
      price: 2500,
      additionalCharges: 100
    });

    expect(component.getTotalAmount()).toBe(25100);
  });

  it('should validate canBuy correctly', () => {
    // Invalid form
    expect(component.canBuy()).toBeFalse();

    // Valid form but no stock selected
    component.buyForm.patchValue({
      quantity: 10,
      price: 2500
    });
    expect(component.canBuy()).toBeFalse();

    // Valid form with stock selected
    component.selectedStock = mockStock;
    expect(component.canBuy()).toBeTrue();
  });

  it('should buy new shares successfully', () => {
    const mockResponse: ApiResponse<BuySharesResponse> = {
      success: true,
      message: 'Shares purchased successfully',
      data: {
        id: 1,
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        quantity: 10,
        buyPrice: 2500.00,
        currentPrice: 2500.00,
        totalInvested: 25000.00,
        currentValue: 25000.00,
        unrealizedGainLoss: 0.00,
        returnPercentage: 0.00,
        lastPriceUpdate: '2025-08-06T16:30:00'
      },
      timestamp: '2025-08-06T16:30:00',
      error: null
    };

    mockStockService.buyShares.and.returnValue(of(mockResponse));

    component.selectedStock = mockStock;
    component.buyForm.patchValue({
      quantity: 10,
      price: 2500,
      additionalCharges: 100,
      description: 'Test purchase'
    });

    component.onBuy();

    expect(mockStockService.buyShares).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Shares purchased successfully!', 'Close', { duration: 3000 });
    expect(mockDialogRef.close).toHaveBeenCalledWith(mockResponse.data);
  });

  it('should buy more shares of existing holding successfully', () => {
    // Set up existing holding data
    component.data = {
      portfolioId: 1,
      portfolioName: 'Test Portfolio',
      existingHolding: {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        currentPrice: 2500.00
      }
    };

    const mockResponse: ApiResponse<BuySharesResponse> = {
      success: true,
      message: 'Shares purchased successfully',
      data: {
        id: 1,
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        quantity: 15,
        buyPrice: 2525.00,
        currentPrice: 2500.00,
        totalInvested: 37875.00,
        currentValue: 37500.00,
        unrealizedGainLoss: -375.00,
        returnPercentage: -0.99,
        lastPriceUpdate: '2025-08-06T16:30:00'
      },
      timestamp: '2025-08-06T16:30:00',
      error: null
    };

    mockStockService.buyMoreShares.and.returnValue(of(mockResponse));

    component.buyForm.patchValue({
      quantity: 5,
      price: 2550,
      additionalCharges: 50
    });

    component.onBuy();

    expect(mockStockService.buyMoreShares).toHaveBeenCalledWith(1, 'RELIANCE', 5, 2550, 50, 1, undefined);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Shares purchased successfully!', 'Close', { duration: 3000 });
    expect(mockDialogRef.close).toHaveBeenCalledWith(mockResponse.data);
  });

  it('should handle buy shares error', (done) => {
    spyOn(console, 'error');
    mockStockService.buyShares.and.returnValue(throwError(() => new Error('API Error')));

    component.selectedStock = mockStock;
    component.buyForm.patchValue({
      quantity: 10,
      price: 2500
    });

    component.onBuy();

    // Use setTimeout to allow the async error handling to complete
    setTimeout(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to buy shares:', jasmine.any(Error));
      expect(mockSnackBar.open).toHaveBeenCalledWith('Failed to purchase shares', 'Close', { duration: 5000 });
      expect(component.isLoading).toBeFalse();
      done();
    }, 0);
  });

  it('should handle unsuccessful buy response', () => {
    const mockResponse: ApiResponse<BuySharesResponse> = {
      success: false,
      message: 'Insufficient funds',
      data: null,
      timestamp: '2025-08-06T16:30:00',
      error: 'Insufficient funds'
    };

    mockStockService.buyShares.and.returnValue(of(mockResponse));

    component.selectedStock = mockStock;
    component.buyForm.patchValue({
      quantity: 10,
      price: 2500
    });

    component.onBuy();

    expect(mockSnackBar.open).toHaveBeenCalledWith('Insufficient funds', 'Close', { duration: 5000 });
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should validate form fields', () => {
    // Test required quantity
    component.buyForm.get('quantity')?.setValue(null);
    expect(component.buyForm.get('quantity')?.hasError('required')).toBeTrue();

    // Test minimum quantity
    component.buyForm.get('quantity')?.setValue(0);
    expect(component.buyForm.get('quantity')?.hasError('min')).toBeTrue();

    // Test required price
    component.buyForm.get('price')?.setValue(null);
    expect(component.buyForm.get('price')?.hasError('required')).toBeTrue();

    // Test minimum price
    component.buyForm.get('price')?.setValue(0);
    expect(component.buyForm.get('price')?.hasError('min')).toBeTrue();

    // Test minimum additional charges
    component.buyForm.get('additionalCharges')?.setValue(-1);
    expect(component.buyForm.get('additionalCharges')?.hasError('min')).toBeTrue();
  });
});
