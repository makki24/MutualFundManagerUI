import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Investment, InvestmentSummary } from '../models/investment.model';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserInvestments(userId: number, activeOnly?: boolean): Observable<ApiResponse<Investment[]>> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly.toString());
    }

    return this.http.get<ApiResponse<Investment[]>>(
      `${this.API_URL}/investments/user/${userId}`,
      { params }
    );
  }

  getPortfolioInvestments(portfolioId: number): Observable<ApiResponse<Investment[]>> {
    return this.http.get<ApiResponse<Investment[]>>(
      `${this.API_URL}/investments/portfolio/${portfolioId}`
    );
  }

  getUserInvestmentSummary(userId: number): Observable<ApiResponse<InvestmentSummary>> {
    return this.http.get<ApiResponse<InvestmentSummary>>(
      `${this.API_URL}/investments/user/${userId}/summary`
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

  investInPortfolio(
    portfolioId: number,
    userId: number,
    investmentAmount: number,
    adminUserId: number,
    transactionDate?: Date
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('investmentAmount', investmentAmount.toString())
      .set('adminUserId', adminUserId.toString());

    if (transactionDate) {
      params = params.set('transactionDate', this.formatDateTime(transactionDate));
    }

    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/portfolios/${portfolioId}/users/${userId}/invest`,
      {},
      { params }
    );
  }

  withdrawFromPortfolio(
    portfolioId: number,
    userId: number,
    unitsToWithdraw: number,
    adminUserId: number,
    transactionDate?: Date
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('unitsToWithdraw', unitsToWithdraw.toString())
      .set('adminUserId', adminUserId.toString());

    if (transactionDate) {
      params = params.set('transactionDate', this.formatDateTime(transactionDate));
    }

    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/portfolios/${portfolioId}/users/${userId}/withdraw`,
      {},
      { params }
    );
  }
}
