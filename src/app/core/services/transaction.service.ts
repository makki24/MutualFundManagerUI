import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Transaction, TransactionFilter, TransactionResponse, PaginationHeaders } from '../models/transaction.model';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/transactions`;

  getUserTransactions(userId: number, filter?: TransactionFilter): Observable<TransactionResponse> {
    let params = new HttpParams();
    if (filter) {
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.size !== undefined) params = params.set('size', filter.size.toString());
      if (filter.type) params = params.set('type', filter.type);
      if (filter.portfolioId) params = params.set('portfolioId', filter.portfolioId.toString());
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
    }

    return this.http.get<ApiResponse<Transaction[]>>(
      `${this.API_URL}/user/${userId}`,
      {
        params,
        observe: 'response'
      }
    ).pipe(
      map((response: HttpResponse<ApiResponse<Transaction[]>>) => {
        const headers = response.headers;
        const pagination: PaginationHeaders = {
          totalCount: parseInt(headers.get('X-Total-Count') || '0', 10),
          totalPages: parseInt(headers.get('X-Total-Pages') || '0', 10),
          currentPage: parseInt(headers.get('X-Current-Page') || '0', 10),
          pageSize: parseInt(headers.get('X-Page-Size') || '20', 10),
          hasNext: response.body?.data.length === 20
        };

        return {
          transactions: response.body?.data || [],
          pagination
        };
      })
    );
  }

  getPortfolioTransactions(portfolioId: number, filter?: TransactionFilter): Observable<TransactionResponse> {
    let params = new HttpParams();
    if (filter) {
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.size !== undefined) params = params.set('size', filter.size.toString());
      if (filter.type) params = params.set('type', filter.type);
      if (filter.symbol) params = params.set('symbol', filter.symbol);
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      // When no user is selected, request portfolio-level transactions where user is null
      if (filter.userId === undefined || filter.userId === null) {
        params = params.set('userNullOnly', 'true');
      }
    }

    return this.http.get<ApiResponse<Transaction[]>>(
      `${this.API_URL}/portfolio/${portfolioId}`,
      {
        params,
        observe: 'response'
      }
    ).pipe(
      map((response: HttpResponse<ApiResponse<Transaction[]>>) => {
        const headers = response.headers;
        const pagination: PaginationHeaders = {
          totalCount: parseInt(headers.get('X-Total-Count') || '0', 10),
          totalPages: parseInt(headers.get('X-Total-Pages') || '0', 10),
          currentPage: parseInt(headers.get('X-Current-Page') || '0', 10),
          pageSize: parseInt(headers.get('X-Page-Size') || '20', 10),
          hasNext: response.body?.data.length === 20,
        };

        return {
          transactions: response.body?.data || [],
          pagination
        };
      })
    );
  }
}
