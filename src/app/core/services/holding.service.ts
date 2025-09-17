import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import {
  Holding,
  CreateHoldingRequest,
  BuySharesRequest,
  SellSharesRequest,
  PriceUpdateRequest,
  PriceUpdateResponse
} from '../models/holding.model';

@Injectable({
  providedIn: 'root'
})
export class HoldingService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPortfolioHoldings(portfolioId: number, activeOnly?: boolean): Observable<ApiResponse<Holding[]>> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly.toString());
    }

    return this.http.get<ApiResponse<Holding[]>>(
      `${this.API_URL}/portfolios/${portfolioId}/holdings`,
      { params }
    );
  }

  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  sellShares(
    portfolioId: number,
    symbol: string,
    quantity: number,
    sellPrice: number,
    adminUserId: number,
    additionalCharges?: number,
    transactionDate?: Date
  ): Observable<ApiResponse<Holding>> {
    let params = new HttpParams()
      .set('quantity', quantity.toString())
      .set('sellPrice', sellPrice.toString())
      .set('adminUserId', adminUserId.toString());

    if (additionalCharges !== undefined && additionalCharges !== null) {
      params = params.set('additionalCharges', additionalCharges.toString());
    }

    if (transactionDate) {
      params = params.set('transactionDate', this.formatDateTime(transactionDate));
    }

    return this.http.post<ApiResponse<Holding>>(
      `${this.API_URL}/portfolios/${portfolioId}/holdings/symbol/${symbol}/sell`,
      {},
      { params }
    );
  }

  updatePrices(portfolioId: number, priceUpdates: PriceUpdateRequest): Observable<ApiResponse<PriceUpdateResponse>> {
    return this.http.put<ApiResponse<PriceUpdateResponse>>(
      `${this.API_URL}/portfolios/${portfolioId}/holdings/prices`,
      priceUpdates
    );
  }
}
