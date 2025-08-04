import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioFee, CreatePortfolioFeeRequest, UserFeeAllocation } from '../models/portfolio.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioFeeService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Portfolio Fee Management
  createPortfolioFee(portfolioId: number, feeRequest: CreatePortfolioFeeRequest, createdByUserId: number): Observable<ApiResponse<PortfolioFee>> {
    const params = new HttpParams().set('createdByUserId', createdByUserId.toString());
    return this.http.post<ApiResponse<PortfolioFee>>(`${this.API_URL}/portfolios/${portfolioId}/fees`, feeRequest, { params });
  }

  getPortfolioFees(portfolioId: number, activeOnly: boolean = false): Observable<ApiResponse<PortfolioFee[]>> {
    const endpoint = activeOnly ? 'active' : '';
    return this.http.get<ApiResponse<PortfolioFee[]>>(`${this.API_URL}/portfolios/${portfolioId}/fees${endpoint ? '/' + endpoint : ''}`);
  }

  getPortfolioFeeById(portfolioId: number, feeId: number): Observable<ApiResponse<PortfolioFee>> {
    return this.http.get<ApiResponse<PortfolioFee>>(`${this.API_URL}/portfolios/${portfolioId}/fees/${feeId}`);
  }

  deactivatePortfolioFee(portfolioId: number, feeId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/portfolios/${portfolioId}/fees/${feeId}`);
  }

  // Fee Allocation Management
  getUserFeeAllocations(userId: number): Observable<ApiResponse<UserFeeAllocation[]>> {
    return this.http.get<ApiResponse<UserFeeAllocation[]>>(`${this.API_URL}/users/${userId}/fee-allocations`);
  }

  getPortfolioFeeAllocations(portfolioId: number): Observable<ApiResponse<UserFeeAllocation[]>> {
    return this.http.get<ApiResponse<UserFeeAllocation[]>>(`${this.API_URL}/portfolios/${portfolioId}/fee-allocations`);
  }

  getFeeAllocations(portfolioId: number, feeId: number): Observable<ApiResponse<UserFeeAllocation[]>> {
    return this.http.get<ApiResponse<UserFeeAllocation[]>>(`${this.API_URL}/portfolios/${portfolioId}/fees/${feeId}/allocations`);
  }

  // Fee Statistics and Reports
  getPortfolioFeeStats(portfolioId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/portfolios/${portfolioId}/fees/stats`);
  }

  getUserFeeStats(userId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/users/${userId}/fees/stats`);
  }

  // Fee Calculation Preview
  previewFeeCalculation(portfolioId: number, feeRequest: CreatePortfolioFeeRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/portfolios/${portfolioId}/fees/preview`, feeRequest);
  }
}
