import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';

import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
          [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
          [mode]="(isHandset$ | async) ? 'over' : 'side'"
          [opened]="(isHandset$ | async) === false">

        <mat-toolbar class="sidenav-header">
          <mat-icon class="logo-icon">account_balance</mat-icon>
          <span class="logo-text">MF Manager</span>
        </mat-toolbar>

        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          @if (isAdmin) {
            <a mat-list-item routerLink="/portfolios" routerLinkActive="active">
              <mat-icon matListItemIcon>pie_chart</mat-icon>
              <span matListItemTitle>Portfolios</span>
            </a>

            <a mat-list-item routerLink="/users" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Users</span>
            </a>

            <a mat-list-item routerLink="/holdings" routerLinkActive="active">
              <mat-icon matListItemIcon>trending_up</mat-icon>
              <span matListItemTitle>Holdings</span>
            </a>
          }

          <a mat-list-item routerLink="/transactions" routerLinkActive="active">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Transactions</span>
          </a>

          <mat-divider></mat-divider>

          <a mat-list-item (click)="logout()">
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Logout</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="main-toolbar">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>

          <span class="toolbar-title">{{ getPageTitle() }}</span>

          <span class="toolbar-spacer"></span>

          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <div class="user-info">
              <div class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
              <div class="user-role">{{ currentUser?.role }}</div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="changePassword()">
              <mat-icon>lock</mat-icon>
              <span>Change Password</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <div class="main-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
      background: #fafafa;
    }

    .sidenav-header {
      background: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
    }

    .logo-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 500;
    }

    .main-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .toolbar-title {
      font-size: 18px;
      font-weight: 500;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .main-content {
      padding: 20px;
      background: #f5f5f5;
      min-height: calc(100vh - 64px);
    }

    .user-info {
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .user-name {
      font-weight: 500;
      font-size: 14px;
    }

    .user-role {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    mat-nav-list a.active {
      background: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    mat-nav-list a.active mat-icon {
      color: #1976d2;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 16px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  currentUser: User | null = null;
  isAdmin = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'ADMIN';
    });
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/portfolios')) return 'Portfolios';
    if (url.includes('/users')) return 'Users';
    if (url.includes('/holdings')) return 'Holdings';
    if (url.includes('/transactions')) return 'Transactions';
    return 'Mutual Fund Manager';
  }

  changePassword(): void {
    // TODO: Implement change password dialog
    this.snackBar.open('Change password feature coming soon!', 'Close', { duration: 3000 });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.snackBar.open('Logged out successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        // Even if logout fails on server, clear local data and redirect
        this.router.navigate(['/login']);
      }
    });
  }
}
