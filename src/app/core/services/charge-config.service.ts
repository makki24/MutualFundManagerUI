import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ChargeConfig, 
  CreateChargeConfigRequest, 
  ChargeTypeOption, 
  CalculationMethodOption 
} from '../models/charge-config.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChargeConfigService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all charge configurations for a portfolio
   */
  getChargeConfigs(portfolioId: number, activeOnly: boolean = false): Observable<ChargeConfig[]> {
    const params = new HttpParams().set('activeOnly', activeOnly.toString());
    
    return this.http.get<ApiResponse<ChargeConfig[]>>(
      `${this.apiUrl}/portfolios/${portfolioId}/charge-configs`,
      { params }
    ).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get a specific charge configuration by ID
   */
  getChargeConfigById(portfolioId: number, configId: number): Observable<ChargeConfig> {
    return this.http.get<ApiResponse<ChargeConfig>>(
      `${this.apiUrl}/portfolios/${portfolioId}/charge-configs/${configId}`
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create a new charge configuration
   */
  createChargeConfig(
    portfolioId: number, 
    userId: number, 
    request: CreateChargeConfigRequest
  ): Observable<ChargeConfig> {
    const params = new HttpParams().set('userId', userId.toString());
    
    return this.http.post<ApiResponse<ChargeConfig>>(
      `${this.apiUrl}/portfolios/${portfolioId}/charge-configs`,
      request,
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update an existing charge configuration
   */
  updateChargeConfig(
    portfolioId: number, 
    configId: number, 
    request: CreateChargeConfigRequest
  ): Observable<ChargeConfig> {
    return this.http.put<ApiResponse<ChargeConfig>>(
      `${this.apiUrl}/portfolios/${portfolioId}/charge-configs/${configId}`,
      request
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Activate a charge configuration
   */
  activateChargeConfig(portfolioId: number, configId: number): Observable<ChargeConfig> {
    return this.http.patch<ApiResponse<ChargeConfig>>(
      `${this.apiUrl}/portfolios/${portfolioId}/charge-configs/${configId}/activate`,
      {}
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Deactivate a charge configuration
   */
  deactivateChargeConfig(portfolioId: number, configId: number): Observable<ChargeConfig> {
    return this.http.patch<ApiResponse<ChargeConfig>>(
      `${this.apiUrl}/portfolios/${portfolioId}/charge-configs/${configId}/deactivate`,
      {}
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete a charge configuration
   */
  deleteChargeConfig(portfolioId: number, configId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/portfolios/${portfolioId}/charge-configs/${configId}`
    ).pipe(
      map(() => undefined)
    );
  }

  /**
   * Get available charge types
   */
  getChargeTypes(portfolioId: number): Observable<ChargeTypeOption[]> {
    return this.http.get<ApiResponse<ChargeTypeOption[]>>(
      `${this.apiUrl}/portfolios/${portfolioId}/charge-configs/charge-types`
    ).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get available calculation methods
   */
  getCalculationMethods(portfolioId: number): Observable<CalculationMethodOption[]> {
    return this.http.get<ApiResponse<CalculationMethodOption[]>>(
      `${this.apiUrl}/portfolios/${portfolioId}/charge-configs/calculation-methods`
    ).pipe(
      map(response => response.data || [])
    );
  }
}
