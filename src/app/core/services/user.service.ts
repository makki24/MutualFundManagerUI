import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest, UpdateUserRequest, UserStats } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getUsers(activeOnly?: boolean, role?: string, search?: string): Observable<ApiResponse<User[]>> {
    let params = new HttpParams();
    if (activeOnly !== undefined) params = params.set('activeOnly', activeOnly.toString());
    if (role) params = params.set('role', role);
    if (search) params = params.set('search', search);

    return this.http.get<ApiResponse<User[]>>(`${this.API_URL}/users`, { params });
  }

  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/users/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.API_URL}/users`, user);
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/users/${id}`, user);
  }

  activateUser(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/users/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/users/${id}/deactivate`, {});
  }

  getUserStats(): Observable<ApiResponse<UserStats>> {
    return this.http.get<ApiResponse<UserStats>>(`${this.API_URL}/users/stats`);
  }
}
