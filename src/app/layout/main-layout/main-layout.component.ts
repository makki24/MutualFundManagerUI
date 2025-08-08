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
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { ChangePasswordDialogComponent } from '../../features/auth/change-password-dialog.component';

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
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

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
