import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Portfolio,
  PortfolioDetails,
  CreatePortfolioRequest,
  InvestmentRequest,
  WithdrawalRequest,
  UpdatePortfolioRequest,
  PortfolioFee,
  CreatePortfolioFeeRequest,
  UserFeeAllocation, Holding
} from '../models/portfolio.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getPortfolios(params?: { activeOnly?: boolean; search?: string; userId?: number }): Observable<ApiResponse<Portfolio[]>> {
    let httpParams = new HttpParams();
    if (params?.activeOnly !== undefined) {
      httpParams = httpParams.set('activeOnly', params.activeOnly.toString());
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.userId) {
      httpParams = httpParams.set('userId', params.userId.toString());
    }

    return this.http.get<ApiResponse<Portfolio[]>>(`${this.API_URL}/portfolios`, { params: httpParams });
  }

  getPortfolioDetails(id: number): Observable<ApiResponse<PortfolioDetails>> {
    return this.http.get<ApiResponse<PortfolioDetails>>(`${this.API_URL}/portfolios/${id}`);
  }

  createPortfolio(portfolio: any, createdByUserId: number): Observable<ApiResponse<Portfolio>> {
    const params = new HttpParams().set('createdByUserId', createdByUserId.toString());
    return this.http.post<ApiResponse<Portfolio>>(`${this.API_URL}/portfolios`, portfolio, { params });
  }

  updatePortfolio(id: number, portfolio: UpdatePortfolioRequest): Observable<ApiResponse<Portfolio>> {
    return this.http.put<ApiResponse<Portfolio>>(`${this.API_URL}/portfolios/${id}`, portfolio);
  }

  investInPortfolio(portfolioId: number, userId: number, request: InvestmentRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/portfolios/${portfolioId}/users/${userId}/invest`, request);
  }

  withdrawFromPortfolio(portfolioId: number, userId: number, request: WithdrawalRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/portfolios/${portfolioId}/users/${userId}/withdraw`, request);
  }

  updateNav(portfolioId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/portfolios/${portfolioId}/nav/update`, {});
  }

  calculateFees(portfolioId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/portfolios/${portfolioId}/fees/calculate`, {});
  }

  getPortfolioHoldings(portfolioId: number): Observable<ApiResponse<Holding[]>> {
    return this.http.get<ApiResponse<Holding[]>>(`${this.API_URL}/portfolios/${portfolioId}/holdings`);
  }

  addHolding(portfolioId: number, holding: any): Observable<any> {
    return this.http.post(`${this.API_URL}/portfolios/${portfolioId}/holdings`, holding);
  }

  buyShares(portfolioId: number, symbol: string, request: any): Observable<any> {
    return this.http.post(`${this.API_URL}/portfolios/${portfolioId}/holdings/symbol/${symbol}/buy`, request);
  }

  sellShares(portfolioId: number, symbol: string, request: any): Observable<any> {
    return this.http.post(`${this.API_URL}/portfolios/${portfolioId}/holdings/symbol/${symbol}/sell`, request);
  }

  updatePrices(portfolioId: number, prices: any): Observable<any> {
    return this.http.put(`${this.API_URL}/portfolios/${portfolioId}/holdings/prices`, prices);
  }

  updateAllPrices(portfolioId: number): Observable<any> {
    return this.http.put(`${this.API_URL}/portfolios/${portfolioId}/holdings/prices/update-all`, {});
  }

  // New Fee Management Methods
  createPortfolioFee(portfolioId: number, feeRequest: CreatePortfolioFeeRequest, createdByUserId: number): Observable<ApiResponse<PortfolioFee>> {
    const params = new HttpParams().set('createdByUserId', createdByUserId.toString());
    return this.http.post<ApiResponse<PortfolioFee>>(`${this.API_URL}/portfolios/${portfolioId}/fees`, feeRequest, { params });
  }

  getPortfolioFees(portfolioId: number, activeOnly: boolean = false): Observable<ApiResponse<PortfolioFee[]>> {
    const endpoint = activeOnly ? 'active' : '';
    return this.http.get<ApiResponse<PortfolioFee[]>>(`${this.API_URL}/portfolios/${portfolioId}/fees`);
  }

  getPortfolioFeeById(portfolioId: number, feeId: number): Observable<ApiResponse<PortfolioFee>> {
    return this.http.get<ApiResponse<PortfolioFee>>(`${this.API_URL}/portfolios/${portfolioId}/fees/${feeId}`);
  }

  deactivatePortfolioFee(portfolioId: number, feeId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/portfolios/${portfolioId}/fees/${feeId}`);
  }

  getUserFeeAllocations(userId: number): Observable<ApiResponse<UserFeeAllocation[]>> {
    return this.http.get<ApiResponse<UserFeeAllocation[]>>(`${this.API_URL}/users/${userId}/fee-allocations`);
  }

  getPortfolioFeeAllocations(portfolioId: number): Observable<ApiResponse<UserFeeAllocation[]>> {
    return this.http.get<ApiResponse<UserFeeAllocation[]>>(`${this.API_URL}/portfolios/${portfolioId}/fee-allocations`);
  }

  // Enhanced investment method with fee calculation
  investInPortfolioWithFees(portfolioId: number, userId: number, investmentAmount: number, adminUserId: number): Observable<any> {
    const params = new HttpParams()
      .set('investmentAmount', investmentAmount.toString())
      .set('adminUserId', adminUserId.toString());
    return this.http.post(`${this.API_URL}/portfolios/${portfolioId}/users/${userId}/invest`, {}, { params });
  }
}
