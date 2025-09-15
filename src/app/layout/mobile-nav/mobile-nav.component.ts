import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatRippleModule
  ],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('out', style({
        transform: 'translateX(-100%)',
        opacity: 0
      })),
      transition('out => in', animate('300ms ease-in-out')),
      transition('in => out', animate('300ms ease-in-out'))
    ]),
    trigger('fadeInOut', [
      state('in', style({
        opacity: 0.5,
        visibility: 'visible'
      })),
      state('out', style({
        opacity: 0,
        visibility: 'hidden'
      })),
      transition('out => in', animate('300ms ease-in-out')),
      transition('in => out', animate('300ms ease-in-out'))
    ])
  ],
  template: `
    <!-- Overlay -->
    <div class="mobile-nav-overlay" 
         [@fadeInOut]="isOpen ? 'in' : 'out'"
         (click)="closeNav()"
         [class.active]="isOpen">
    </div>

    <!-- Mobile Navigation Panel -->
    <nav class="mobile-nav-panel" 
         [@slideInOut]="isOpen ? 'in' : 'out'"
         [class.active]="isOpen">
      
      <!-- Header -->
      <div class="mobile-nav-header">
        <div class="nav-brand">
          <mat-icon class="brand-icon">account_balance</mat-icon>
          <span class="brand-text">MF Manager</span>
        </div>
        <button mat-icon-button (click)="closeNav()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- User Info -->
      @if (currentUser) {
        <div class="user-section">
          <div class="user-avatar">
            <mat-icon>account_circle</mat-icon>
          </div>
          <div class="user-info">
            <div class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
            <div class="user-role">{{ currentUser.role }}</div>
          </div>
        </div>
      }

      <mat-divider></mat-divider>

      <!-- Navigation Items -->
      <div class="nav-items">
        <a class="nav-item" 
           routerLink="/dashboard" 
           routerLinkActive="active"
           (click)="navigateAndClose('/dashboard')"
           matRipple>
          <mat-icon class="nav-icon">dashboard</mat-icon>
          <span class="nav-label">Dashboard</span>
          <mat-icon class="nav-arrow">chevron_right</mat-icon>
        </a>

        @if (isAdmin) {
          <a class="nav-item" 
             routerLink="/portfolios" 
             routerLinkActive="active"
             (click)="navigateAndClose('/portfolios')"
             matRipple>
            <mat-icon class="nav-icon">pie_chart</mat-icon>
            <span class="nav-label">Portfolios</span>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </a>

          <a class="nav-item" 
             routerLink="/users" 
             routerLinkActive="active"
             (click)="navigateAndClose('/users')"
             matRipple>
            <mat-icon class="nav-icon">people</mat-icon>
            <span class="nav-label">Users</span>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </a>

          <a class="nav-item" 
             routerLink="/holdings" 
             routerLinkActive="active"
             (click)="navigateAndClose('/holdings')"
             matRipple>
            <mat-icon class="nav-icon">trending_up</mat-icon>
            <span class="nav-label">Holdings</span>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </a>

          <a class="nav-item" 
             routerLink="/database" 
             routerLinkActive="active"
             (click)="navigateAndClose('/database')"
             matRipple>
            <mat-icon class="nav-icon">storage</mat-icon>
            <span class="nav-label">Database</span>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </a>
        } @else {
          <!-- For non-admin users, show My Investments instead of Portfolios -->
          <a class="nav-item" 
             routerLink="/dashboard" 
             routerLinkActive="active"
             (click)="navigateAndClose('/dashboard')"
             matRipple>
            <mat-icon class="nav-icon">account_balance_wallet</mat-icon>
            <span class="nav-label">My Investments</span>
            <mat-icon class="nav-arrow">chevron_right</mat-icon>
          </a>
        }

        <a class="nav-item" 
           routerLink="/transactions" 
           routerLinkActive="active"
           (click)="navigateAndClose('/transactions')"
           matRipple>
          <mat-icon class="nav-icon">receipt_long</mat-icon>
          <span class="nav-label">Transactions</span>
          <mat-icon class="nav-arrow">chevron_right</mat-icon>
        </a>

        <mat-divider class="nav-divider"></mat-divider>

        <!-- Account Actions -->
        <button class="nav-item nav-button" 
                (click)="changePassword()"
                matRipple>
          <mat-icon class="nav-icon">lock</mat-icon>
          <span class="nav-label">Change Password</span>
          <mat-icon class="nav-arrow">chevron_right</mat-icon>
        </button>

        <button class="nav-item nav-button logout-item" 
                (click)="logout()"
                matRipple>
          <mat-icon class="nav-icon">logout</mat-icon>
          <span class="nav-label">Logout</span>
          <mat-icon class="nav-arrow">chevron_right</mat-icon>
        </button>
      </div>

      <!-- Footer -->
      <div class="nav-footer">
        <div class="app-version">
          <mat-icon>info</mat-icon>
          <span>Version 1.0.0</span>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .mobile-nav-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      visibility: hidden;
      opacity: 0;
    }

    .mobile-nav-overlay.active {
      visibility: visible;
      opacity: 0.5;
    }

    .mobile-nav-panel {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: #fff;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      transform: translateX(-100%);
      opacity: 0;
    }

    .mobile-nav-panel.active {
      transform: translateX(0);
      opacity: 1;
    }

    .mobile-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 64px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .brand-text {
      font-size: 20px;
      font-weight: 600;
    }

    .close-button {
      color: white;
    }

    .close-button mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #f8f9fa;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-avatar mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #6c757d;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
    }

    .user-role {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .nav-items {
      flex: 1;
      padding: 8px 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      text-decoration: none;
      color: #333;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .nav-item:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .nav-item.active {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border-right: 3px solid #667eea;
    }

    .nav-item.active .nav-icon {
      color: #667eea;
    }

    .nav-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #666;
    }

    .nav-label {
      flex: 1;
      font-weight: 500;
    }

    .nav-arrow {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
    }

    .nav-button {
      font-family: inherit;
    }

    .nav-divider {
      margin: 8px 20px;
    }

    .logout-item {
      color: #dc3545;
    }

    .logout-item .nav-icon {
      color: #dc3545;
    }

    .logout-item:hover {
      background: rgba(220, 53, 69, 0.1);
    }

    .nav-footer {
      padding: 16px 20px;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .app-version {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #666;
    }

    .app-version mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Responsive adjustments */
    @media (max-width: 320px) {
      .mobile-nav-panel {
        width: 100vw;
      }
    }

    @media (max-width: 480px) {
      .mobile-nav-panel {
        width: 90vw;
        max-width: 320px;
      }
    }
  `]
})
export class MobileNavComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeNavigation = new EventEmitter<void>();
  @Output() changePasswordRequest = new EventEmitter<void>();
  @Output() logoutRequest = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;
  isAdmin = false;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'ADMIN';
    });
  }

  closeNav(): void {
    this.closeNavigation.emit();
  }

  navigateAndClose(route: string): void {
    this.router.navigate([route]);
    this.closeNav();
  }

  changePassword(): void {
    this.changePasswordRequest.emit();
    this.closeNav();
  }

  logout(): void {
    this.logoutRequest.emit();
    this.closeNav();
  }
}
