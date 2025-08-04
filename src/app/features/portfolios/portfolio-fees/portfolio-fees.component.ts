import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PortfolioFeeService } from '../../../core/services/portfolio-fee.service';
import { AuthService } from '../../../core/services/auth.service';
import { PortfolioFee } from '../../../core/models/portfolio.model';
import { CreatePortfolioFeeDialogComponent } from './create-portfolio-fee-dialog/create-portfolio-fee-dialog.component';
import { FeeDetailsDialogComponent } from './fee-details-dialog/fee-details-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-portfolio-fees',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './portfolio-fees.component.html',
  styleUrls: ['./portfolio-fees.component.scss']
})
export class PortfolioFeesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private portfolioFeeService = inject(PortfolioFeeService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  portfolioId!: number;
  activeFee: PortfolioFee | null = null;
  allFees: PortfolioFee[] = [];
  isLoading = false;
  isAdmin = false;

  displayedColumns = ['amount', 'period', 'status', 'progress', 'actions'];

  ngOnInit(): void {
    this.portfolioId = +this.route.snapshot.paramMap.get('id')!;
    this.isAdmin = this.authService.getCurrentUser()?.role === 'ADMIN';
    this.loadPortfolioFees();
  }

  loadPortfolioFees(): void {
    this.isLoading = true;

    // Load all fees for history
    this.portfolioFeeService.getPortfolioFees(this.portfolioId).subscribe({
      next: (response) => {
        if (response.success) {
          this.allFees = response.data || [];
          this.activeFee = this.allFees.find(fee => fee.isActive) || null;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load portfolio fees:', error);
        this.snackBar.open('Failed to load portfolio fees', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  openCreateFeeDialog(): void {
    if (this.activeFee) {
      this.snackBar.open('Portfolio already has an active fee. Deactivate it first.', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(CreatePortfolioFeeDialogComponent, {
      width: '600px',
      data: { portfolioId: this.portfolioId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPortfolioFees();
        this.snackBar.open('Portfolio fee created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  viewFeeDetails(fee: PortfolioFee): void {
    this.dialog.open(FeeDetailsDialogComponent, {
      width: '800px',
      data: { fee }
    });
  }

  deactivateFee(fee: PortfolioFee): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Deactivate Fee',
        message: `Are you sure you want to deactivate this fee of ₹${fee.totalFeeAmount}?`,
        confirmText: 'Deactivate',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.portfolioFeeService.deactivatePortfolioFee(this.portfolioId, fee.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.loadPortfolioFees();
              this.snackBar.open('Fee deactivated successfully', 'Close', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Failed to deactivate fee:', error);
            this.snackBar.open('Failed to deactivate fee', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  getFeeAllocationPercentage(fee: PortfolioFee): number {
    if (fee.totalFeeAmount === 0) return 100; // Zero fees are always 100% "allocated"
    return Math.round(((fee.allocatedFeeAmount || 0) / fee.totalFeeAmount) * 100);
  }

  formatDateRange(fromDate: string, toDate: string): string {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
  }

  getDaysRemaining(toDate: string): number {
    const today = new Date();
    const endDate = new Date(toDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  isExpired(toDate: string): boolean {
    return this.getDaysRemaining(toDate) === 0;
  }

  goBack(): void {
    this.router.navigate(['/portfolios']);
  }
}
