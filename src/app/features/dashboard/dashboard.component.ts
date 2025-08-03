import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminDashboardComponent,
    UserDashboardComponent
  ],
  template: `
    @if (isAdmin) {
      <app-admin-dashboard></app-admin-dashboard>
    } @else {
      <app-user-dashboard></app-user-dashboard>
    }
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);

  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
  }
}
