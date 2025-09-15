import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { AuthService } from '../../core/services/auth.service';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard.component';
import { UserDashboardMobileComponent } from './user-dashboard-mobile.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminDashboardComponent,
    UserDashboardComponent,
    UserDashboardMobileComponent
  ],
  template: `
    @if (isAdmin) {
      <app-admin-dashboard></app-admin-dashboard>
    } @else {
      @if (isMobile) {
        <app-user-dashboard-mobile></app-user-dashboard-mobile>
      } @else {
        <app-user-dashboard></app-user-dashboard>
      }
    }
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);

  isAdmin = false;
  isMobile = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    
    // Detect mobile device
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }
}
