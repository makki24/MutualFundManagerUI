import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

import { PortfolioService } from '../../core/services/portfolio.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Portfolio, CreatePortfolioRequest, UpdatePortfolioRequest } from '../../core/models/portfolio.model';
import { User } from '../../core/models/user.model';

interface DialogData {
  mode: 'create' | 'edit' | 'view';
  portfolio?: Portfolio;
}

@Component({
  selector: 'app-portfolio-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatStepperModule,
    MatCardModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        @switch (data.mode) {
          @case ('create') { Create New Portfolio }
          @case ('edit') { Edit Portfolio }
          @case ('view') { Portfolio Details }
        }
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      @if (data.mode === 'view') {
        <!-- View Mode -->
        <div class="portfolio-details">
          <div class="portfolio-header">
            <div class="portfolio-icon">
              <mat-icon>pie_chart</mat-icon>
            </div>
            <div class="portfolio-info">
              <h3>{{ data.portfolio?.name }}</h3>
              <p>{{ data.portfolio?.description }}</p>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="details-grid">
            <div class="detail-item">
              <label>NAV Value</label>
              <span>{{ data.portfolio?.navValue | currency:'USD':'symbol':'1.4-4' }}</span>
            </div>
            <div class="detail-item">
              <label>Total AUM</label>
              <span>{{ data.portfolio?.totalAum | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
            <div class="detail-item">
              <label>Total Units</label>
              <span>{{ data.portfolio?.totalUnits | number:'1.4-4' }}</span>
            </div>
            <div class="detail-item">
              <label>Remaining Cash</label>
              <span>{{ data.portfolio?.remainingCash | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
            <div class="detail-item">
              <label>Total Investors</label>
              <span>{{ data.portfolio?.totalInvestors }}</span>
            </div>
            <div class="detail-item">
              <label>Total Holdings</label>
              <span>{{ data.portfolio?.totalHoldings }}</span>
            </div>
            <div class="detail-item">
              <label>Created By</label>
              <span>{{ data.portfolio?.createdBy?.username }}</span>
            </div>
            <div class="detail-item">
              <label>Created Date</label>
              <span>{{ data.portfolio?.createdAt | date:'medium' }}</span>
            </div>
          </div>
        </div>
      } @else {
        <!-- Form Mode -->
        @if (data.mode === 'create') {
          <mat-stepper [linear]="true" #stepper>
            <!-- Step 1: Basic Information -->
            <mat-step [stepControl]="basicInfoForm" label="Basic Information">
              <form [formGroup]="basicInfoForm" class="step-form">
                <mat-form-field appearance="outline" class="form-field full-width">
                  <mat-label>Portfolio Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter portfolio name">
                  <mat-icon matSuffix>pie_chart</mat-icon>
                  @if (basicInfoForm.get('name')?.hasError('required') && basicInfoForm.get('name')?.touched) {
                    <mat-error>Portfolio name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="3"
                           placeholder="Enter portfolio description"></textarea>
                  <mat-icon matSuffix>description</mat-icon>
                </mat-form-field>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Initial NAV Value</mat-label>
                    <input matInput formControlName="initialNavValue" type="number"
                           step="0.0001" placeholder="10.0000">
                    <span matTextPrefix>$</span>
                    @if (basicInfoForm.get('initialNavValue')?.hasError('required') && basicInfoForm.get('initialNavValue')?.touched) {
                      <mat-error>Initial NAV value is required</mat-error>
                    }
                    @if (basicInfoForm.get('initialNavValue')?.hasError('min') && basicInfoForm.get('initialNavValue')?.touched) {
                      <mat-error>NAV value must be greater than 0</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Initial Cash</mat-label>
                    <input matInput formControlName="initialCash" type="number"
                           step="0.01" placeholder="100000.00">
                    <span matTextPrefix>$</span>
                    @if (basicInfoForm.get('initialCash')?.hasError('required') && basicInfoForm.get('initialCash')?.touched) {
                      <mat-error>Initial cash is required</mat-error>
                    }
                    @if (basicInfoForm.get('initialCash')?.hasError('min') && basicInfoForm.get('initialCash')?.touched) {
                      <mat-error>Initial cash must be greater than 0</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button mat-raised-button color="primary" matStepperNext
                          [disabled]="basicInfoForm.invalid">
                    Next
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Fee Structure -->
            <mat-step [stepControl]="feeStructureForm" label="Fee Structure">
              <form [formGroup]="feeStructureForm" class="step-form">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Management Fee (%)</mat-label>
                    <input matInput formControlName="managementFeePercentage" type="number"
                           step="0.01" placeholder="2.00">
                    <span matTextSuffix>%</span>
                    @if (feeStructureForm.get('managementFeePercentage')?.hasError('required') && feeStructureForm.get('managementFeePercentage')?.touched) {
                      <mat-error>Management fee is required</mat-error>
                    }
                    @if (feeStructureForm.get('managementFeePercentage')?.hasError('min') && feeStructureForm.get('managementFeePercentage')?.touched) {
                      <mat-error>Fee must be 0 or greater</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Entry Load (%)</mat-label>
                    <input matInput formControlName="entryLoadPercentage" type="number"
                           step="0.01" placeholder="1.00">
                    <span matTextSuffix>%</span>
                    @if (feeStructureForm.get('entryLoadPercentage')?.hasError('required') && feeStructureForm.get('entryLoadPercentage')?.touched) {
                      <mat-error>Entry load is required</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Exit Load (%)</mat-label>
                    <input matInput formControlName="exitLoadPercentage" type="number"
                           step="0.01" placeholder="0.50">
                    <span matTextSuffix>%</span>
                    @if (feeStructureForm.get('exitLoadPercentage')?.hasError('required') && feeStructureForm.get('exitLoadPercentage')?.touched) {
                      <mat-error>Exit load is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field">
                    <mat-label>Brokerage Buy (%)</mat-label>
                    <input matInput formControlName="brokerageBuyPercentage" type="number"
                           step="0.01" placeholder="0.25">
                    <span matTextSuffix>%</span>
                    @if (feeStructureForm.get('brokerageBuyPercentage')?.hasError('required') && feeStructureForm.get('brokerageBuyPercentage')?.touched) {
                      <mat-error>Brokerage buy is required</mat-error>
                    }
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Brokerage Sell (%)</mat-label>
                  <input matInput formControlName="brokerageSellPercentage" type="number"
                         step="0.01" placeholder="0.25">
                  <span matTextSuffix>%</span>
                  @if (feeStructureForm.get('brokerageSellPercentage')?.hasError('required') && feeStructureForm.get('brokerageSellPercentage')?.touched) {
                    <mat-error>Brokerage sell is required</mat-error>
                  }
                </mat-form-field>

                <div class="step-actions">
                  <button mat-button matStepperPrevious>
                    <mat-icon>arrow_back</mat-icon>
                    Back
                  </button>
                  <button mat-raised-button color="primary" matStepperNext
                          [disabled]="feeStructureForm.invalid">
                    Next
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Initial Investors -->
            <mat-step [stepControl]="investorsForm" label="Initial Investors">
              <form [formGroup]="investorsForm" class="step-form">
                <div class="investors-header">
                  <h4>Add Initial Investors</h4>
                  <button mat-icon-button type="button" (click)="addInvestor()"
                          matTooltip="Add investor">
                    <mat-icon>person_add</mat-icon>
                  </button>
                </div>

                <div formArrayName="initialInvestors" class="investors-list">
                  @for (investor of initialInvestors.controls; track $index) {
                    <mat-card class="investor-card" [formGroupName]="$index">
                      <mat-card-content>
                        <div class="investor-form">
                          <mat-form-field appearance="outline" class="form-field">
                            <mat-label>Select User</mat-label>
                            <mat-select formControlName="userId">
                              @for (user of availableUsers; track user.id) {
                                <mat-option [value]="user.id">
                                  {{ user.firstName }} {{ user.lastName }} ({{ user.username }})
                                </mat-option>
                              }
                            </mat-select>
                            @if (investor.get('userId')?.hasError('required') && investor.get('userId')?.touched) {
                              <mat-error>User is required</mat-error>
                            }
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="form-field">
                            <mat-label>Investment Amount</mat-label>
                            <input matInput formControlName="investmentAmount" type="number"
                                   step="0.01" placeholder="10000.00">
                            <span matTextPrefix>$</span>
                            @if (investor.get('investmentAmount')?.hasError('required') && investor.get('investmentAmount')?.touched) {
                              <mat-error>Investment amount is required</mat-error>
                            }
                            @if (investor.get('investmentAmount')?.hasError('min') && investor.get('investmentAmount')?.touched) {
                              <mat-error>Amount must be greater than 0</mat-error>
                            }
                          </mat-form-field>

                          <button mat-icon-button type="button" (click)="removeInvestor($index)"
                                  color="warn" matTooltip="Remove investor">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>

                @if (initialInvestors.length === 0) {
                  <div class="no-investors">
                    <mat-icon>people_outline</mat-icon>
                    <p>No initial investors added</p>
                    <button mat-raised-button color="primary" (click)="addInvestor()">
                      <mat-icon>person_add</mat-icon>
                      Add First Investor
                    </button>
                  </div>
                }

                <div class="step-actions">
                  <button mat-button matStepperPrevious>
                    <mat-icon>arrow_back</mat-icon>
                    Back
                  </button>
                  <button mat-raised-button color="primary" (click)="onSubmit()"
                          [disabled]="!isFormValid() || isLoading">
                    @if (isLoading) {
                      <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                      <span>Creating...</span>
                    } @else {
                      <mat-icon>save</mat-icon>
                      <span>Create Portfolio</span>
                    }
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>
        } @else {
          <!-- Edit Mode -->
          <form [formGroup]="editForm" class="edit-form">
            <mat-form-field appearance="outline" class="form-field full-width">
              <mat-label>Portfolio Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter portfolio name">
              <mat-icon matSuffix>pie_chart</mat-icon>
              @if (editForm.get('name')?.hasError('required') && editForm.get('name')?.touched) {
                <mat-error>Portfolio name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"
                       placeholder="Enter portfolio description"></textarea>
              <mat-icon matSuffix>description</mat-icon>
            </mat-form-field>

            <h4>Fee Structure</h4>
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Management Fee (%)</mat-label>
                <input matInput formControlName="managementFeePercentage" type="number" step="0.01">
                <span matTextSuffix>%</span>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Entry Load (%)</mat-label>
                <input matInput formControlName="entryLoadPercentage" type="number" step="0.01">
                <span matTextSuffix>%</span>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Exit Load (%)</mat-label>
                <input matInput formControlName="exitLoadPercentage" type="number" step="0.01">
                <span matTextSuffix>%</span>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Brokerage Buy (%)</mat-label>
                <input matInput formControlName="brokerageBuyPercentage" type="number" step="0.01">
                <span matTextSuffix>%</span>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Brokerage Sell (%)</mat-label>
              <input matInput formControlName="brokerageSellPercentage" type="number" step="0.01">
              <span matTextSuffix>%</span>
            </mat-form-field>
          </form>
        }
      }
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      @if (data.mode === 'view') {
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary" (click)="editPortfolio()">
          <mat-icon>edit</mat-icon>
          Edit Portfolio
        </button>
      } @else if (data.mode === 'edit') {
        <button mat-button mat-dialog-close [disabled]="isLoading">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSubmit()"
                [disabled]="editForm.invalid || isLoading">
          @if (isLoading) {
            <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
            <span>Updating...</span>
          } @else {
            <mat-icon>save</mat-icon>
            <span>Update Portfolio</span>
          }
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .dialog-content {
      padding: 20px 24px;
      min-width: 600px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .portfolio-details {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .portfolio-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .portfolio-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .portfolio-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .portfolio-info h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .portfolio-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-item label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-item span {
      font-size: 14px;
      color: #1a1a1a;
    }

    .step-form, .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .form-field .mat-mdc-form-field-outline {
      border-radius: 8px;
    }

    .step-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .investors-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .investors-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .investors-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .investor-card {
      border: 1px solid #e0e0e0;
    }

    .investor-form {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .no-investors {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      text-align: center;
      color: #666;
    }

    .no-investors mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-investors p {
      margin: 0 0 16px 0;
      font-size: 14px;
    }

    .dialog-actions {
      padding: 0 24px 20px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .dialog-actions button {
      min-width: 120px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .button-spinner {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .dialog-content {
        min-width: 400px;
        padding: 16px 20px;
      }

      .dialog-header {
        padding: 16px 20px 0;
      }

      .dialog-actions {
        padding: 0 20px 16px;
        flex-direction: column;
      }

      .dialog-actions button {
        width: 100%;
      }

      .form-row {
        flex-direction: column;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .investor-form {
        flex-direction: column;
      }
    }
  `]
})
export class PortfolioFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private portfolioService = inject(PortfolioService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<PortfolioFormDialogComponent>);

  basicInfoForm: FormGroup;
  feeStructureForm: FormGroup;
  investorsForm: FormGroup;
  editForm: FormGroup;

  availableUsers: User[] = [];
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.basicInfoForm = this.createBasicInfoForm();
    this.feeStructureForm = this.createFeeStructureForm();
    this.investorsForm = this.createInvestorsForm();
    this.editForm = this.createEditForm();
  }

  ngOnInit(): void {
    this.loadUsers();

    if (this.data.mode === 'edit' && this.data.portfolio) {
      this.populateEditForm(this.data.portfolio);
    }
  }

  private createBasicInfoForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      initialNavValue: [10.0000, [Validators.required, Validators.min(0.0001)]],
      initialCash: [100000.00, [Validators.required, Validators.min(0.01)]]
    });
  }

  private createFeeStructureForm(): FormGroup {
    return this.fb.group({
      managementFeePercentage: [2.00, [Validators.required, Validators.min(0)]],
      entryLoadPercentage: [1.00, [Validators.required, Validators.min(0)]],
      exitLoadPercentage: [0.50, [Validators.required, Validators.min(0)]],
      brokerageBuyPercentage: [0.25, [Validators.required, Validators.min(0)]],
      brokerageSellPercentage: [0.25, [Validators.required, Validators.min(0)]]
    });
  }

  private createInvestorsForm(): FormGroup {
    return this.fb.group({
      initialInvestors: this.fb.array([])
    });
  }

  private createEditForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      managementFeePercentage: [0, [Validators.required, Validators.min(0)]],
      entryLoadPercentage: [0, [Validators.required, Validators.min(0)]],
      exitLoadPercentage: [0, [Validators.required, Validators.min(0)]],
      brokerageBuyPercentage: [0, [Validators.required, Validators.min(0)]],
      brokerageSellPercentage: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get initialInvestors(): FormArray {
    return this.investorsForm.get('initialInvestors') as FormArray;
  }

  private loadUsers(): void {
    this.userService.getUsers(true, 'USER').subscribe({
      next: (response) => {
        if (response.success) {
          this.availableUsers = response.data || [];
        }
      },
      error: (error) => {
        console.error('Failed to load users:', error);
      }
    });
  }

  private populateEditForm(portfolio: Portfolio): void {
    this.editForm.patchValue({
      name: portfolio.name,
      description: portfolio.description || '',
      managementFeePercentage: portfolio.managementFeePercentage || 0,
      entryLoadPercentage: portfolio.entryLoadPercentage || 0,
      exitLoadPercentage: portfolio.exitLoadPercentage || 0,
      brokerageBuyPercentage: portfolio.brokerageBuyPercentage || 0,
      brokerageSellPercentage: portfolio.brokerageSellPercentage || 0
    });
  }

  addInvestor(): void {
    const investorForm = this.fb.group({
      userId: ['', [Validators.required]],
      investmentAmount: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.initialInvestors.push(investorForm);
  }

  removeInvestor(index: number): void {
    this.initialInvestors.removeAt(index);
  }

  isFormValid(): boolean {
    return this.basicInfoForm.valid &&
           this.feeStructureForm.valid &&
           this.investorsForm.valid;
  }

  editPortfolio(): void {
    this.data.mode = 'edit';
    if (this.data.portfolio) {
      this.populateEditForm(this.data.portfolio);
    }
  }

  onSubmit(): void {
    if (this.data.mode === 'create') {
      this.createPortfolio();
    } else if (this.data.mode === 'edit') {
      this.updatePortfolio();
    }
  }

  private createPortfolio(): void {
    if (!this.isFormValid()) return;

    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      this.isLoading = false;
      return;
    }

    const request: CreatePortfolioRequest = {
      ...this.basicInfoForm.value,
      ...this.feeStructureForm.value,
      ...this.investorsForm.value
    };

    this.portfolioService.createPortfolio(request, currentUser.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.snackBar.open('Portfolio created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message || 'Failed to create portfolio. Please try again.',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  private updatePortfolio(): void {
    if (!this.data.portfolio || this.editForm.invalid) return;

    this.isLoading = true;
    const request: UpdatePortfolioRequest = this.editForm.value;

    this.portfolioService.updatePortfolio(this.data.portfolio.id, request).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.snackBar.open('Portfolio updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message || 'Failed to update portfolio. Please try again.',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }
}
