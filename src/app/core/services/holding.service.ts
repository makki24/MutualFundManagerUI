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

  sellShares(
    portfolioId: number,
    symbol: string,
    quantity: number,
    sellPrice: number,
    adminUserId: number,
    additionalCharges?: number
  ): Observable<ApiResponse<Holding>> {
    let params = new HttpParams()
      .set('quantity', quantity.toString())
      .set('sellPrice', sellPrice.toString())
      .set('adminUserId', adminUserId.toString());

    if (additionalCharges !== undefined && additionalCharges !== null) {
      params = params.set('additionalCharges', additionalCharges.toString());
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
