import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminDashboard, UserDashboard, MarketOverview, NavHistoryResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAdminDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.API_URL}/dashboard/admin`);
  }

  getUserDashboard(userId: number): Observable<UserDashboard> {
    return this.http.get<UserDashboard>(`${this.API_URL}/dashboard/user/${userId}`);
  }

  getPortfolioDashboard(portfolioId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/portfolio/${portfolioId}`);
  }

  getMarketOverview(): Observable<MarketOverview> {
    return this.http.get<MarketOverview>(`${this.API_URL}/dashboard/market`);
  }

  getNavHistory(portfolioId: number, startDate?: string, endDate?: string): Observable<NavHistoryResponse> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    
    return this.http.get<NavHistoryResponse>(`${this.API_URL}/portfolios/${portfolioId}/nav-history`, { params });
  }
}
