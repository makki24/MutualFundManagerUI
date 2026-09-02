import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';

interface TabItem {
  path: string;
  icon: string;
  label: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-bottom-tab-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatRippleModule
  ],
  template: `
    <nav class="bottom-tab-bar">
      @for (tab of visibleTabs; track tab.path) {
        <a class="tab-item"
           [routerLink]="tab.path"
           [class.active]="isActive(tab.path)"
           matRipple
           [matRippleCentered]="true"
           [matRippleUnbounded]="true">
          <mat-icon class="tab-icon">{{ tab.icon }}</mat-icon>
          <span class="tab-label">{{ tab.label }}</span>
          <div class="active-indicator" *ngIf="isActive(tab.path)"></div>
        </a>
      }
    </nav>
  `,
  styles: [`
    .bottom-tab-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: calc(56px + env(safe-area-inset-bottom, 0px));
      padding-bottom: env(safe-area-inset-bottom, 0px);
      background: var(--surface-card);
      border-top: 1px solid var(--surface-border);
      box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      flex: 1;
      height: 56px;
      text-decoration: none;
      color: var(--text-tertiary);
      position: relative;
      transition: color var(--transition-fast);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .tab-item:active {
      transform: scale(0.92);
    }

    .tab-item.active {
      color: var(--color-primary);
    }

    .tab-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      transition: transform var(--transition-fast);
    }

    .tab-item.active .tab-icon {
      transform: scale(1.1);
    }

    .tab-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: 1;
    }

    .active-indicator {
      position: absolute;
      top: 4px;
      width: 32px;
      height: 3px;
      background: var(--gradient-primary);
      border-radius: 0 0 3px 3px;
    }
  `]
})
export class BottomTabBarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentPath = '';
  isAdmin = false;

  private allTabs: TabItem[] = [
    { path: '/dashboard', icon: 'dashboard', label: 'Home' },
    { path: '/portfolios', icon: 'pie_chart', label: 'Portfolios', adminOnly: true },
    { path: '/transactions', icon: 'receipt_long', label: 'Transactions' },
    { path: '/holdings', icon: 'trending_up', label: 'Holdings', adminOnly: true },
  ];

  get visibleTabs(): TabItem[] {
    return this.allTabs.filter(tab => !tab.adminOnly || this.isAdmin);
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentPath = this.router.url.split('?')[0];

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = (event.urlAfterRedirects ?? event.url).split('?')[0];
    });
  }

  isActive(path: string): boolean {
    if (path === '/dashboard') {
      return this.currentPath === '/dashboard';
    }
    return this.currentPath.startsWith(path);
  }
}
