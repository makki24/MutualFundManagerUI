import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock, StockPrice, BuySharesRequest, BuySharesResponse } from '../models/stock.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchStocks(query: string): Observable<ApiResponse<Stock[]>> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<Stock[]>>(`${this.API_URL}/stocks/search`, { params });
  }

  getStockPrice(symbol: string): Observable<ApiResponse<StockPrice>> {
    return this.http.get<ApiResponse<StockPrice>>(`${this.API_URL}/stocks/${symbol}/price`);
  }

  buyShares(portfolioId: number, request: BuySharesRequest, adminUserId: number): Observable<ApiResponse<BuySharesResponse>> {
    const params = new HttpParams().set('adminUserId', adminUserId.toString());
    return this.http.post<ApiResponse<BuySharesResponse>>(`${this.API_URL}/portfolios/${portfolioId}/holdings/buy`, request, { params });
  }

  buyMoreShares(portfolioId: number, symbol: string, quantity: number, buyPrice: number, additionalCharges: number = 0, adminUserId: number): Observable<ApiResponse<BuySharesResponse>> {
    const params = new HttpParams()
      .set('quantity', quantity.toString())
      .set('buyPrice', buyPrice.toString())
      .set('additionalCharges', additionalCharges.toString())
      .set('adminUserId', adminUserId.toString());

    return this.http.post<ApiResponse<BuySharesResponse>>(`${this.API_URL}/portfolios/${portfolioId}/holdings/symbol/${symbol}/buy`, {}, { params });
  }
}
