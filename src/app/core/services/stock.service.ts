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

  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  buyShares(portfolioId: number, request: BuySharesRequest, adminUserId: number, transactionDate?: Date): Observable<ApiResponse<BuySharesResponse>> {
    let params = new HttpParams().set('adminUserId', adminUserId.toString());
    if (transactionDate) {
      params = params.set('transactionDate', this.formatDateTime(transactionDate));
    }
    return this.http.post<ApiResponse<BuySharesResponse>>(`${this.API_URL}/portfolios/${portfolioId}/holdings/buy`, request, { params });
  }

  buyMoreShares(portfolioId: number, symbol: string, quantity: number, buyPrice: number, additionalCharges: number = 0, adminUserId: number, transactionDate?: Date): Observable<ApiResponse<BuySharesResponse>> {
    let params = new HttpParams()
      .set('quantity', quantity.toString())
      .set('buyPrice', buyPrice.toString())
      .set('additionalCharges', additionalCharges.toString())
      .set('adminUserId', adminUserId.toString());

    if (transactionDate) {
      params = params.set('transactionDate', this.formatDateTime(transactionDate));
    }

    return this.http.post<ApiResponse<BuySharesResponse>>(`${this.API_URL}/portfolios/${portfolioId}/holdings/symbol/${symbol}/buy`, {}, { params });
  }

  sellShares(portfolioId: number, symbol: string, quantity: number, sellPrice: number, additionalCharges: number = 0, adminUserId: number, transactionDate?: Date): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('quantity', quantity.toString())
      .set('sellPrice', sellPrice.toString())
      .set('additionalCharges', additionalCharges.toString())
      .set('adminUserId', adminUserId.toString());

    if (transactionDate) {
      params = params.set('transactionDate', this.formatDateTime(transactionDate));
    }

    return this.http.post<ApiResponse<any>>(`${this.API_URL}/portfolios/${portfolioId}/holdings/symbol/${symbol}/sell`, {}, { params });
  }
}
