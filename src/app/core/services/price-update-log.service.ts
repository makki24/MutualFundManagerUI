import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

export interface PriceUpdateLog {
  id: number;
  portfolioId: number;
  portfolioName: string;
  symbol: string;
  companyName: string;
  oldPrice: number;
  newPrice: number;
  priceChange: number;
  priceChangePercentage: number;
  updateStatus: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'PRICE_CHANGE_REJECTED';
  errorMessage?: string;
  errorReason?: string;
  updateType: 'SCHEDULED_DAILY' | 'MANUAL_SINGLE' | 'MANUAL_BULK' | 'MANUAL_BY_DATE';
  updateDate: string;
  executionTimeMs?: number;
  dataSource?: string;
  batchId?: string;
}

export interface PriceUpdateLogPage {
  content: PriceUpdateLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UpdateSummary {
  statusCounts: { [key: string]: number };
  totalUpdates: number;
  successRate: number;
}

export interface DashboardStats {
  last24Hours: {
    total: number;
    successful: number;
    failed: number;
  };
  last7Days: UpdateSummary;
  last30Days: UpdateSummary;
  recentScheduledUpdates: PriceUpdateLog[];
}

export interface ScheduledUpdateInfo {
  nextScheduledUpdate: string;
  scheduledUpdatesEnabled: boolean;
  lastScheduledUpdateStatus: string;
}

export interface GroupedPriceUpdateLog {
  batchId: string;
  portfolioId: number;
  portfolioName: string;
  updateDate: string;
  updateType: string;
  totalUpdates: number;
  successfulUpdates: number;
  failedUpdates: number;
  successRate: number;
  navImpact: {
    oldNav: number;
    newNav: number;
    navChange: number;
    navChangePercentage: number;
    totalValueChange: number;
  };
  stockUpdates: {
    symbol: string;
    companyName: string;
    oldPrice: number;
    newPrice: number;
    priceChange: number;
    priceChangePercentage: number;
    updateStatus: string;
    errorMessage?: string;
    executionTimeMs?: number;
  }[];
}

export interface GroupedPriceUpdateLogPage {
  content: GroupedPriceUpdateLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class PriceUpdateLogService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get price update logs for a portfolio with pagination
   */
  getLogsByPortfolio(portfolioId: number, page: number = 0, size: number = 20): Observable<ApiResponse<PriceUpdateLogPage>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PriceUpdateLogPage>>(`${this.API_URL}/price-update-logs/portfolio/${portfolioId}`, { params });
  }

  /**
   * Get price update logs for a specific symbol in a portfolio
   */
  getLogsByPortfolioAndSymbol(portfolioId: number, symbol: string, page: number = 0, size: number = 20): Observable<ApiResponse<PriceUpdateLogPage>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PriceUpdateLogPage>>(`${this.API_URL}/price-update-logs/portfolio/${portfolioId}/symbol/${symbol}`, { params });
  }

  /**
   * Get price update logs within a date range
   */
  getLogsByDateRange(startDate: string, endDate: string, page: number = 0, size: number = 20): Observable<ApiResponse<PriceUpdateLogPage>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PriceUpdateLogPage>>(`${this.API_URL}/price-update-logs/date-range`, { params });
  }

  /**
   * Get logs by batch ID
   */
  getLogsByBatchId(batchId: string): Observable<ApiResponse<PriceUpdateLog[]>> {
    return this.http.get<ApiResponse<PriceUpdateLog[]>>(`${this.API_URL}/price-update-logs/batch/${batchId}`);
  }

  /**
   * Get logs with filters
   */
  getLogsWithFilters(
    portfolioId: number | null,
    startDate: string,
    endDate: string,
    status: string | null,
    page: number = 0,
    size: number = 20
  ): Observable<ApiResponse<PriceUpdateLogPage>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());

    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    if (status) {
      params = params.set('status', status);
    }

    const url = portfolioId 
      ? `${this.API_URL}/price-update-logs/portfolio/${portfolioId}/filtered`
      : `${this.API_URL}/price-update-logs/date-range`;

    return this.http.get<ApiResponse<PriceUpdateLogPage>>(url, { params });
  }

  /**
   * Get update summary for dashboard
   */
  getUpdateSummary(startDate: string, endDate: string): Observable<ApiResponse<UpdateSummary>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<ApiResponse<UpdateSummary>>(`${this.API_URL}/price-update-logs/summary`, { params });
  }

  /**
   * Get latest updates for each symbol in a portfolio
   */
  getLatestUpdatesByPortfolio(portfolioId: number): Observable<ApiResponse<PriceUpdateLog[]>> {
    return this.http.get<ApiResponse<PriceUpdateLog[]>>(`${this.API_URL}/price-update-logs/portfolio/${portfolioId}/latest`);
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.API_URL}/price-update-logs/dashboard-stats`);
  }

  /**
   * Get logs by update type within date range
   */
  getLogsByUpdateType(
    updateType: string,
    startDate: string,
    endDate: string,
    page: number = 0,
    size: number = 20
  ): Observable<ApiResponse<PriceUpdateLogPage>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PriceUpdateLogPage>>(`${this.API_URL}/price-update-logs/type/${updateType}`, { params });
  }

  /**
   * Get scheduled update information
   */
  getScheduledUpdateInfo(): Observable<ApiResponse<ScheduledUpdateInfo>> {
    return this.http.get<ApiResponse<ScheduledUpdateInfo>>(`${this.API_URL}/price-update-logs/scheduled-info`);
  }

  /**
   * Manually trigger price update for testing (Admin only)
   */
  triggerManualUpdate(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/price-update-logs/trigger-manual-update`, {});
  }

  /**
   * Get grouped price update logs with NAV calculations
   */
  getGroupedLogs(
    portfolioId: number | null,
    startDate: string,
    endDate: string,
    page: number = 0,
    size: number = 20
  ): Observable<ApiResponse<GroupedPriceUpdateLogPage>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());

    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }

    return this.http.get<ApiResponse<GroupedPriceUpdateLogPage>>(`${this.API_URL}/price-update-logs/grouped`, { params });
  }

  /**
   * Cleanup old logs (Admin only)
   */
  cleanupOldLogs(daysToKeep: number = 30): Observable<ApiResponse<string>> {
    let params = new HttpParams().set('daysToKeep', daysToKeep.toString());
    return this.http.delete<ApiResponse<string>>(`${this.API_URL}/price-update-logs/cleanup`, { params });
  }
}
