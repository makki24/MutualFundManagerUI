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
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.5); z-index: 1000;
      visibility: hidden; opacity: 0;
    }
    .mobile-nav-overlay.active { visibility: visible; opacity: 0.5; }

    .mobile-nav-panel {
      position: fixed; top: 0; left: 0; width: 280px; height: 100vh;
      background: var(--surface-card); z-index: 1001;
      display: flex; flex-direction: column;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
      transform: translateX(-100%); opacity: 0;
    }
    .mobile-nav-panel.active { transform: translateX(0); opacity: 1; }

    .mobile-nav-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%);
      color: white; min-height: 64px;
    }

    .nav-brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { font-size: 26px; width: 26px; height: 26px; color: #c4b5fd; }
    .brand-text { font-size: 19px; font-weight: 700; letter-spacing: -0.01em; }
    .close-button { color: rgba(255,255,255,0.8); }
    .close-button:hover { color: #fff; }
    .close-button mat-icon { font-size: 22px; width: 22px; height: 22px; }

    .user-section {
      display: flex; align-items: center; gap: 14px;
      padding: 18px 20px; background: var(--surface-bg);
      border-bottom: 1px solid var(--surface-border);
    }

    .user-avatar {
      width: 44px; height: 44px; border-radius: var(--radius-full);
      background: var(--gradient-primary);
      display: flex; align-items: center; justify-content: center;
    }
    .user-avatar mat-icon { font-size: 24px; width: 24px; height: 24px; color: #fff; }
    .user-info { flex: 1; }
    .user-name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
    .user-role { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }

    .nav-items { flex: 1; padding: 8px 0; overflow-y: auto; }

    .nav-item {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 20px; text-decoration: none;
      color: var(--text-primary); border: none; background: none;
      width: 100%; text-align: left; font-size: 15px;
      cursor: pointer; transition: all var(--transition-fast);
      position: relative; font-family: inherit;
    }
    .nav-item:hover { background: var(--surface-hover); }

    .nav-item.active {
      background: var(--color-primary-50);
      color: var(--color-primary);
    }
    .nav-item.active::before {
      content: ''; position: absolute; left: 0; top: 8px; bottom: 8px;
      width: 3px; background: var(--color-primary); border-radius: 0 3px 3px 0;
    }
    .nav-item.active .nav-icon { color: var(--color-primary); }

    .nav-icon { font-size: 22px; width: 22px; height: 22px; color: var(--text-secondary); transition: color var(--transition-fast); }
    .nav-label { flex: 1; font-weight: 500; }
    .nav-arrow { font-size: 16px; width: 16px; height: 16px; color: var(--text-tertiary); }

    .nav-divider { margin: 8px 20px; border-color: var(--surface-border); }

    .logout-item { color: var(--color-danger); }
    .logout-item .nav-icon { color: rgba(239, 68, 68, 0.6); }
    .logout-item:hover { background: var(--color-danger-light); }
    .logout-item:hover .nav-icon { color: var(--color-danger); }

    .nav-footer {
      padding: 14px 20px; border-top: 1px solid var(--surface-border);
      background: var(--surface-bg);
    }
    .app-version { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-tertiary); }
    .app-version mat-icon { font-size: 14px; width: 14px; height: 14px; }

    @media (max-width: 320px) { .mobile-nav-panel { width: 100vw; } }
    @media (max-width: 480px) { .mobile-nav-panel { width: 90vw; max-width: 320px; } }
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
