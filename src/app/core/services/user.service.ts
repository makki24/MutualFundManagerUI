import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Investment } from '../models/portfolio.model';
import { InvestmentSummary } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users`, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${id}`, user);
  }

  activateUser(id: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/users/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/users/${id}/deactivate`, {});
  }

  getUserInvestments(userId: number): Observable<Investment[]> {
    return this.http.get<Investment[]>(`${this.API_URL}/investments/user/${userId}`);
  }

  getUserInvestmentSummary(userId: number): Observable<InvestmentSummary> {
    return this.http.get<InvestmentSummary>(`${this.API_URL}/investments/user/${userId}/summary`);
  }
}
