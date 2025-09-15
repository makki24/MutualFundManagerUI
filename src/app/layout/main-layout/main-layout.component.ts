import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Location } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay, filter } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { ChangePasswordDialogComponent } from '../../features/auth/change-password-dialog.component';
import { PortfolioFormDialogComponent } from '../../features/portfolios/portfolio-form-dialog.component';
import { UserFormDialogComponent } from '../../features/users/user-form-dialog.component';
import { ToolbarService } from '../toolbar/toolbar.service';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';

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
    MatTooltipModule,
    MatDividerModule,
    MobileNavComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private location = inject(Location);
  public toolbar = inject(ToolbarService);

  currentUser: User | null = null;
  isAdmin = false;
  isSidebarCollapsed = false;
  isMobileNavOpen = false;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  private readonly SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

  private lastUrl: string | null = null;
  private prevUrl: string | null = null;

  ngOnInit(): void {
    // Load sidebar state from localStorage
    this.loadSidebarState();

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'ADMIN';
    });

    // Track previous route to decide back button visibility
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.prevUrl = this.lastUrl;
      this.lastUrl = e.urlAfterRedirects ?? e.url;
    });
  }

  createUserFromToolbar(): void {
    if (!this.isAdmin) return;
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(() => {
      // User list component will refresh accordingly
    });
  }

  goBack(): void {
    this.location.back();
  }

  isRoute(path: string): boolean {
    return this.router.url.includes(path);
  }

  isPortfolioListRoute(): boolean {
    const currentPath = (this.router.url.split('?')[0]) || '';
    return currentPath === '/portfolios';
  }

  showBackButton(): boolean {
    const currentPath = (this.router.url.split('?')[0]) || '';
    if (currentPath === '/dashboard') return false;
    if (currentPath === '/portfolios' || currentPath === '/users') return false;

    if (currentPath === '/holdings') {
      const prevPath = (this.prevUrl || '').split('?')[0];
      if (!prevPath) return false; // first load via sidebar
      if (['/dashboard', '/portfolios', '/users'].includes(prevPath)) return false; // came from sidebar/root pages
    }
    return true;
  }

  createPortfolioFromToolbar(): void {
    if (!this.isAdmin) return;
    const dialogRef = this.dialog.open(PortfolioFormDialogComponent, {
      maxWidth: 900,
      disableClose: true,
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      // No-op: portfolio-list component will refresh via its own subscription after creation
    });
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/portfolios')) return 'Portfolios';
    if (url.includes('/users')) return 'Users';
    if (url.includes('/holdings')) return 'Holdings';
    if (url.includes('/transactions')) return 'Transactions';
    if (url.includes('/database')) return 'Database Management';
    return 'Mutual Fund Manager';
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.saveSidebarState();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Check if user is not typing in an input field
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' ||
                       target.tagName === 'TEXTAREA' ||
                       target.contentEditable === 'true' ||
                       target.closest('[contenteditable="true"]') !== null;

    // Only handle keyboard shortcuts if not in input field and on desktop
    if (!isInputField) {
      // Use current value instead of subscribing each time
      const isHandset = this.breakpointObserver.isMatched(Breakpoints.Handset);

      if (!isHandset) {
        if (event.key === '[') {
          event.preventDefault();
          this.isSidebarCollapsed = true;
          this.saveSidebarState();
        } else if (event.key === ']') {
          event.preventDefault();
          this.isSidebarCollapsed = false;
          this.saveSidebarState();
        }
      }
    }
  }

  changePassword(): void {
    if (this.currentUser) {
      const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
        width: '450px',
        data: { userId: this.currentUser.id },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Password changed successfully
        }
      });
    }
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  closeMobileNav(): void {
    this.isMobileNavOpen = false;
  }

  onMobileChangePassword(): void {
    this.changePassword();
  }

  onMobileLogout(): void {
    this.logout();
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

  private loadSidebarState(): void {
    try {
      const savedState = localStorage.getItem(this.SIDEBAR_STORAGE_KEY);
      if (savedState !== null) {
        this.isSidebarCollapsed = JSON.parse(savedState);
      }
    } catch (error) {
      // If there's an error parsing the saved state, default to expanded
      this.isSidebarCollapsed = false;
    }
  }

  private saveSidebarState(): void {
    try {
      localStorage.setItem(this.SIDEBAR_STORAGE_KEY, JSON.stringify(this.isSidebarCollapsed));
    } catch (error) {
      // Silently fail if localStorage is not available
      console.warn('Could not save sidebar state to localStorage:', error);
    }
  }
}
