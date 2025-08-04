import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

import { PortfolioFeeService } from '../../../../core/services/portfolio-fee.service';
import { PortfolioFee, UserFeeAllocation } from '../../../../core/models/portfolio.model';

interface DialogData {
  fee: PortfolioFee;
}

@Component({
  selector: 'app-fee-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTableModule,
    MatTabsModule,
    MatDividerModule
  ],
  templateUrl: './fee-details-dialog.component.html',
  styleUrls: ['./fee-details-dialog.component.scss']
})
export class FeeDetailsDialogComponent implements OnInit {
  private portfolioFeeService = inject(PortfolioFeeService);
  private dialogRef = inject(MatDialogRef<FeeDetailsDialogComponent>);

  fee: PortfolioFee;
  userAllocations: UserFeeAllocation[] = [];
  isLoadingAllocations = false;

  allocationColumns = ['user', 'amount', 'unitsDeducted', 'date', 'type'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.fee = data.fee;
  }

  ngOnInit(): void {
    this.loadUserAllocations();
  }

  loadUserAllocations(): void {
    this.isLoadingAllocations = true;

    this.portfolioFeeService.getFeeAllocations(this.fee.portfolioId, this.fee.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.userAllocations = response.data || [];
        }
        this.isLoadingAllocations = false;
      },
      error: (error) => {
        console.error('Failed to load user fee allocations:', error);
        this.isLoadingAllocations = false;
      }
    });
  }

  getFeeAllocationPercentage(): number {
    if (this.fee.totalFeeAmount === 0) return 100;
    return Math.round(((this.fee.allocatedFeeAmount || 0) / this.fee.totalFeeAmount) * 100);
  }

  getDaysRemaining(): number {
    const today = new Date();
    const endDate = new Date(this.fee.toDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  getDaysElapsed(): number {
    const today = new Date();
    const startDate = new Date(this.fee.fromDate);
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diffDays, this.fee.totalDays));
  }

  getProgressPercentage(): number {
    return Math.round((this.getDaysElapsed() / this.fee.totalDays) * 100);
  }

  formatDateRange(): string {
    const from = new Date(this.fee.fromDate);
    const to = new Date(this.fee.toDate);
    return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
  }

  getTotalUsersAffected(): number {
    const uniqueUsers = new Set(this.userAllocations.map(allocation => allocation.userId));
    return uniqueUsers.size;
  }

  getAverageFeePerUser(): number {
    const totalUsers = this.getTotalUsersAffected();
    return totalUsers > 0 ? this.fee.allocatedFeeAmount / totalUsers : 0;
  }

  getTotalCreditsGiven(): number {
    return this.userAllocations
      .filter(allocation => allocation.type === 'CREDIT')
      .reduce((total, allocation) => total + allocation.allocatedAmount, 0);
  }

  getTotalDeductionsMade(): number {
    return this.userAllocations
      .filter(allocation => allocation.type === 'DEDUCTION')
      .reduce((total, allocation) => total + allocation.allocatedAmount, 0);
  }

  isExpired(): boolean {
    return this.getDaysRemaining() === 0;
  }

  close(): void {
    this.dialogRef.close();
  }
}
