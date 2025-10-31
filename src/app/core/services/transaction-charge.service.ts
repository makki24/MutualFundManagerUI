import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TransactionCharge, ChargeStatistics, ApiResponse } from '../models/transaction-charge.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionChargeService {
  private readonly apiUrl = `${environment.apiUrl}/charges`;

  constructor(private http: HttpClient) {}

  /**
   * Get pending review charges
   * GET /api/charges/pending-review
   */
  getPendingReviewCharges(): Observable<TransactionCharge[]> {
    return this.http.get<TransactionCharge[]>(`${this.apiUrl}/pending-review`);
  }

  /**
   * Get ready to apply charges
   * GET /api/charges/ready-to-apply
   */
  getReadyToApplyCharges(): Observable<TransactionCharge[]> {
    return this.http.get<TransactionCharge[]>(`${this.apiUrl}/ready-to-apply`);
  }

  /**
   * Get charges by portfolio
   * GET /api/charges/portfolio/{portfolioId}
   */
  getChargesByPortfolio(portfolioId: number): Observable<TransactionCharge[]> {
    return this.http.get<ApiResponse<TransactionCharge[]>>(`${this.apiUrl}/portfolio/${portfolioId}`)
      .pipe(
        map(response => response.data || [])
      );
  }

  /**
   * Get charges by date
   * GET /api/charges/date/{date}
   */
  getChargesByDate(date: string): Observable<TransactionCharge[]> {
    return this.http.get<TransactionCharge[]>(`${this.apiUrl}/date/${date}`);
  }

  /**
   * Get charges by date range
   * GET /api/charges/date-range
   */
  getChargesByDateRange(startDate: string, endDate: string): Observable<TransactionCharge[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<TransactionCharge[]>(`${this.apiUrl}/date-range`, { params });
  }

  /**
   * Get charge statistics
   * GET /api/charges/statistics
   */
  getChargeStatistics(startDate?: string, endDate?: string): Observable<ChargeStatistics> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    
    return this.http.get<ChargeStatistics>(`${this.apiUrl}/statistics`, { params });
  }

  /**
   * Get charge by ID
   * GET /api/charges/{chargeId}
   */
  getChargeById(chargeId: number): Observable<TransactionCharge> {
    return this.http.get<TransactionCharge>(`${this.apiUrl}/${chargeId}`);
  }

  /**
   * Approve charge
   * PUT /api/charges/{chargeId}/approve?adminUserId={adminUserId}&correction={correction}
   */
  approveCharge(chargeId: number, adminUserId: number, correction: number = 0.0): Observable<TransactionCharge> {
    const params = new HttpParams()
      .set('adminUserId', adminUserId.toString())
      .set('correction', correction.toString());
    return this.http.put<TransactionCharge>(`${this.apiUrl}/${chargeId}/approve`, {}, { params });
  }

  /**
   * Reject charge
   * PUT /api/charges/{chargeId}/reject
   */
  rejectCharge(chargeId: number): Observable<TransactionCharge> {
    return this.http.put<TransactionCharge>(`${this.apiUrl}/${chargeId}/reject`, {});
  }

  /**
   * Apply charge
   * POST /api/charges/{chargeId}/apply
   */
  applyCharge(chargeId: number): Observable<TransactionCharge> {
    return this.http.post<TransactionCharge>(`${this.apiUrl}/${chargeId}/apply`, {});
  }

  /**
   * Calculate charges for portfolio
   * POST /api/charges/calculate-portfolio
   */
  calculateChargesForPortfolio(portfolioId: number, date: string): Observable<TransactionCharge> {
    const params = new HttpParams()
      .set('portfolioId', portfolioId.toString())
      .set('date', date);
    
    return this.http.post<TransactionCharge>(`${this.apiUrl}/calculate-portfolio`, {}, { params });
  }
}
