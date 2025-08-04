import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';

import { PortfolioService } from '../../../core/services/portfolio.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface CreatePortfolioRequest {
  name: string;
  description: string;
  initialNavValue: number;
  initialInvestors: {
    userId: number;
    investmentAmount: number;
  }[];
}

@Component({
  selector: 'app-portfolio-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatStepperModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDividerModule
  ],
  templateUrl: './portfolio-create.component.html',
  styleUrls: ['./portfolio-create.component.scss']
})
export class PortfolioCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private portfolioService = inject(PortfolioService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  basicInfoForm: FormGroup;
  investorsForm: FormGroup;

  availableUsers: User[] = [];
  initialInvestors: { userId: number; investmentAmount: number; user: User }[] = [];
  selectedUserId: number | null = null;
  investmentAmount: number | null = null;

  isLoadingUsers = false;
  isCreating = false;

  investorColumns = ['name', 'username', 'amount', 'actions'];

  constructor() {
    this.basicInfoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      initialNavValue: [10.0000, [Validators.required, Validators.min(0.0001)]]
    });

    this.investorsForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.userService.getUsers(true, 'USER').subscribe({
      next: (response) => {
        if (response.success) {
          this.availableUsers = response.data || [];
        }
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.isLoadingUsers = false;
      }
    });
  }

  addInvestor(): void {
    if (!this.selectedUserId || !this.investmentAmount || this.investmentAmount <= 0) {
      return;
    }

    // Check if user is already added
    if (this.initialInvestors.some(inv => inv.userId === this.selectedUserId)) {
      this.snackBar.open('User is already added as an investor', 'Close', { duration: 3000 });
      return;
    }

    const user = this.availableUsers.find(u => u.id === this.selectedUserId);
    if (!user) {
      return;
    }

    this.initialInvestors.push({
      userId: this.selectedUserId,
      investmentAmount: this.investmentAmount,
      user: user
    });

    // Reset selection
    this.selectedUserId = null;
    this.investmentAmount = null;

    this.snackBar.open('Investor added successfully', 'Close', { duration: 2000 });
  }

  removeInvestor(index: number): void {
    this.initialInvestors.splice(index, 1);
    this.snackBar.open('Investor removed', 'Close', { duration: 2000 });
  }

  getTotalInvestment(): number {
    return this.initialInvestors.reduce((total, inv) => total + inv.investmentAmount, 0);
  }

  createPortfolio(): void {
    if (this.basicInfoForm.invalid || this.initialInvestors.length === 0) {
      this.snackBar.open('Please complete all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isCreating = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      this.isCreating = false;
      return;
    }

    const portfolioData: CreatePortfolioRequest = {
      ...this.basicInfoForm.value,
      initialInvestors: this.initialInvestors.map(inv => ({
        userId: inv.userId,
        investmentAmount: inv.investmentAmount
      }))
    };

    this.portfolioService.createPortfolio(portfolioData, currentUser.id).subscribe({
      next: (response) => {
        this.isCreating = false;
        if (response.success) {
          this.snackBar.open('Portfolio created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/portfolios']);
        }
      },
      error: (error) => {
        this.isCreating = false;
        console.error('Failed to create portfolio:', error);
        this.snackBar.open(
          error.error?.error || 'Failed to create portfolio. Please try again.',
          'Close',
          { duration: 5000 }
        );
      }
    });
  }
}
