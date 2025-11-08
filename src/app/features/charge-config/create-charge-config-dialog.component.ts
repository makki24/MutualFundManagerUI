import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChargeConfigService } from '../../core/services/charge-config.service';
import { AuthService } from '../../core/services/auth.service';
import { 
  ChargeConfig, 
  CreateChargeConfigRequest, 
  ChargeTypeOption, 
  CalculationMethodOption,
  CalculationMethod 
} from '../../core/models/charge-config.model';

@Component({
  selector: 'app-create-charge-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit' : 'Create' }} Charge Configuration</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="config-form">
        <!-- Charge Type -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Charge Type</mat-label>
          <mat-select formControlName="chargeType" [disabled]="isEditMode">
            @for (type of chargeTypes(); track type.value) {
              <mat-option [value]="type.value">{{ type.label }}</mat-option>
            }
          </mat-select>
          @if (form.get('chargeType')?.hasError('required') && form.get('chargeType')?.touched) {
            <mat-error>Charge type is required</mat-error>
          }
        </mat-form-field>

        <!-- Calculation Method -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Calculation Method</mat-label>
          <mat-select formControlName="calculationMethod" (selectionChange)="onCalculationMethodChange()">
            @for (method of calculationMethods(); track method.value) {
              <mat-option [value]="method.value">{{ method.label }}</mat-option>
            }
          </mat-select>
          @if (form.get('calculationMethod')?.hasError('required') && form.get('calculationMethod')?.touched) {
            <mat-error>Calculation method is required</mat-error>
          }
        </mat-form-field>

        <!-- Percentage Field -->
        @if (showPercentageField()) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Charge Percentage (%)</mat-label>
            <input matInput type="number" formControlName="chargePercentage" step="0.001" min="0">
            <mat-hint>Enter as percentage (e.g., 0.1 for 0.1%)</mat-hint>
            @if (form.get('chargePercentage')?.hasError('required') && form.get('chargePercentage')?.touched) {
              <mat-error>Percentage is required</mat-error>
            }
            @if (form.get('chargePercentage')?.hasError('min')) {
              <mat-error>Percentage must be positive</mat-error>
            }
          </mat-form-field>
        }

        <!-- Minimum Charge Field -->
        @if (showMinChargeField()) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Minimum Charge per Transaction (₹)</mat-label>
            <input matInput type="number" formControlName="minChargePerTransaction" step="0.01" min="0">
            @if (form.get('minChargePerTransaction')?.hasError('required') && form.get('minChargePerTransaction')?.touched) {
              <mat-error>Minimum charge is required</mat-error>
            }
          </mat-form-field>
        }

        <!-- Maximum Charge Field -->
        @if (showMaxChargeField()) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Maximum Charge per Transaction (₹)</mat-label>
            <input matInput type="number" formControlName="maxChargePerTransaction" step="0.01" min="0">
            @if (form.get('maxChargePerTransaction')?.hasError('required') && form.get('maxChargePerTransaction')?.touched) {
              <mat-error>Maximum charge is required</mat-error>
            }
          </mat-form-field>
        }

        <!-- Fixed Charge Field -->
        @if (showFixedChargeField()) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Fixed Charge Amount (₹)</mat-label>
            <input matInput type="number" formControlName="fixedChargeAmount" step="0.01" min="0">
            @if (form.get('fixedChargeAmount')?.hasError('required') && form.get('fixedChargeAmount')?.touched) {
              <mat-error>Fixed charge amount is required</mat-error>
            }
          </mat-form-field>
        }

        <!-- Applies To Checkboxes -->
        <div class="checkbox-group">
          <label class="section-label">Applies To:</label>
          <mat-checkbox formControlName="appliesToBuy">Buy Transactions</mat-checkbox>
          <mat-checkbox formControlName="appliesToSell">Sell Transactions</mat-checkbox>
        </div>

        <!-- Description -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description (Optional)</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <!-- Formula Preview -->
        @if (formulaPreview()) {
          <div class="formula-preview">
            <strong>Formula Preview:</strong>
            <p>{{ formulaPreview() }}</p>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="saving()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!form.valid || saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEditMode ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .config-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
    }

    .full-width {
      width: 100%;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }

    .section-label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .formula-preview {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      border-left: 4px solid #1976d2;
    }

    .formula-preview strong {
      display: block;
      margin-bottom: 8px;
      color: #1976d2;
    }

    .formula-preview p {
      margin: 0;
      font-family: 'Courier New', monospace;
      color: #333;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class CreateChargeConfigDialogComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  saving = signal(false);
  chargeTypes = signal<ChargeTypeOption[]>([]);
  calculationMethods = signal<CalculationMethodOption[]>([]);
  showPercentageField = signal(false);
  showMinChargeField = signal(false);
  showMaxChargeField = signal(false);
  showFixedChargeField = signal(false);
  formulaPreview = signal('');

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateChargeConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { portfolioId: number; config: ChargeConfig | null },
    private chargeConfigService: ChargeConfigService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data.config;
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.loadChargeTypes();
    this.loadCalculationMethods();
    
    if (this.isEditMode && this.data.config) {
      this.populateForm(this.data.config);
    }

    // Watch for form changes to update preview
    this.form.valueChanges.subscribe(() => {
      this.updateFormulaPreview();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      chargeType: ['', Validators.required],
      calculationMethod: ['', Validators.required],
      chargePercentage: [null],
      minChargePerTransaction: [null],
      maxChargePerTransaction: [null],
      fixedChargeAmount: [null],
      appliesToBuy: [true],
      appliesToSell: [true],
      description: ['']
    });
  }

  populateForm(config: ChargeConfig): void {
    this.form.patchValue({
      chargeType: config.chargeType,
      calculationMethod: config.calculationMethod,
      chargePercentage: config.chargePercentage,
      minChargePerTransaction: config.minChargePerTransaction,
      maxChargePerTransaction: config.maxChargePerTransaction,
      fixedChargeAmount: config.fixedChargeAmount,
      appliesToBuy: config.appliesToBuy,
      appliesToSell: config.appliesToSell,
      description: config.description
    });
    this.onCalculationMethodChange();
  }

  loadChargeTypes(): void {
    this.chargeConfigService.getChargeTypes(this.data.portfolioId).subscribe({
      next: (types) => this.chargeTypes.set(types),
      error: (error) => console.error('Error loading charge types:', error)
    });
  }

  loadCalculationMethods(): void {
    this.chargeConfigService.getCalculationMethods(this.data.portfolioId).subscribe({
      next: (methods) => this.calculationMethods.set(methods),
      error: (error) => console.error('Error loading calculation methods:', error)
    });
  }

  onCalculationMethodChange(): void {
    const method = this.form.get('calculationMethod')?.value as CalculationMethod;
    
    // Reset validators
    this.form.get('chargePercentage')?.clearValidators();
    this.form.get('minChargePerTransaction')?.clearValidators();
    this.form.get('maxChargePerTransaction')?.clearValidators();
    this.form.get('fixedChargeAmount')?.clearValidators();

    // Show/hide fields based on method
    switch (method) {
      case CalculationMethod.ZERO_BROKERAGE:
        this.showPercentageField.set(false);
        this.showMinChargeField.set(false);
        this.showMaxChargeField.set(false);
        this.showFixedChargeField.set(false);
        break;

      case CalculationMethod.PERCENTAGE_ONLY:
        this.showPercentageField.set(true);
        this.showMinChargeField.set(false);
        this.showMaxChargeField.set(false);
        this.showFixedChargeField.set(false);
        this.form.get('chargePercentage')?.setValidators([Validators.required, Validators.min(0)]);
        break;

      case CalculationMethod.PERCENTAGE_WITH_MIN:
        this.showPercentageField.set(true);
        this.showMinChargeField.set(true);
        this.showMaxChargeField.set(false);
        this.showFixedChargeField.set(false);
        this.form.get('chargePercentage')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('minChargePerTransaction')?.setValidators([Validators.required, Validators.min(0)]);
        break;

      case CalculationMethod.PERCENTAGE_WITH_MAX:
        this.showPercentageField.set(true);
        this.showMinChargeField.set(false);
        this.showMaxChargeField.set(true);
        this.showFixedChargeField.set(false);
        this.form.get('chargePercentage')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('maxChargePerTransaction')?.setValidators([Validators.required, Validators.min(0)]);
        break;

      case CalculationMethod.PERCENTAGE_WITH_MIN_MAX:
        this.showPercentageField.set(true);
        this.showMinChargeField.set(true);
        this.showMaxChargeField.set(true);
        this.showFixedChargeField.set(false);
        this.form.get('chargePercentage')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('minChargePerTransaction')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('maxChargePerTransaction')?.setValidators([Validators.required, Validators.min(0)]);
        break;

      case CalculationMethod.FIXED_PER_TRANSACTION:
      case CalculationMethod.FIXED_PER_SCRIP:
        this.showPercentageField.set(false);
        this.showMinChargeField.set(false);
        this.showMaxChargeField.set(false);
        this.showFixedChargeField.set(true);
        this.form.get('fixedChargeAmount')?.setValidators([Validators.required, Validators.min(0)]);
        break;
    }

    // Update validators
    this.form.get('chargePercentage')?.updateValueAndValidity();
    this.form.get('minChargePerTransaction')?.updateValueAndValidity();
    this.form.get('maxChargePerTransaction')?.updateValueAndValidity();
    this.form.get('fixedChargeAmount')?.updateValueAndValidity();

    this.updateFormulaPreview();
  }

  updateFormulaPreview(): void {
    const method = this.form.get('calculationMethod')?.value;
    const percentage = this.form.get('chargePercentage')?.value;
    const min = this.form.get('minChargePerTransaction')?.value;
    const max = this.form.get('maxChargePerTransaction')?.value;
    const fixed = this.form.get('fixedChargeAmount')?.value;

    let preview = '';

    switch (method) {
      case CalculationMethod.ZERO_BROKERAGE:
        preview = 'Zero brokerage (no charges)';
        break;
      case CalculationMethod.PERCENTAGE_ONLY:
        preview = percentage ? `${percentage}% of transaction value` : 'Percentage of transaction value';
        break;
      case CalculationMethod.PERCENTAGE_WITH_MIN:
        preview = `${percentage || '?'}% of transaction value with minimum ₹${min || '?'} per transaction`;
        break;
      case CalculationMethod.PERCENTAGE_WITH_MAX:
        preview = `${percentage || '?'}% of transaction value with maximum ₹${max || '?'} per transaction`;
        break;
      case CalculationMethod.PERCENTAGE_WITH_MIN_MAX:
        preview = `${percentage || '?'}% of transaction value with minimum ₹${min || '?'} and maximum ₹${max || '?'} per transaction`;
        break;
      case CalculationMethod.FIXED_PER_TRANSACTION:
        preview = `Fixed ₹${fixed || '?'} per transaction`;
        break;
      case CalculationMethod.FIXED_PER_SCRIP:
        preview = `Fixed ₹${fixed || '?'} per scrip`;
        break;
    }

    this.formulaPreview.set(preview);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const request: CreateChargeConfigRequest = {
      chargeType: this.form.value.chargeType,
      calculationMethod: this.form.value.calculationMethod,
      chargePercentage: this.form.value.chargePercentage ? this.form.value.chargePercentage / 100 : undefined,
      minChargePerTransaction: this.form.value.minChargePerTransaction,
      maxChargePerTransaction: this.form.value.maxChargePerTransaction,
      fixedChargeAmount: this.form.value.fixedChargeAmount,
      appliesToBuy: this.form.value.appliesToBuy,
      appliesToSell: this.form.value.appliesToSell,
      description: this.form.value.description
    };

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      this.saving.set(false);
      return;
    }

    const operation = this.isEditMode
      ? this.chargeConfigService.updateChargeConfig(this.data.portfolioId, this.data.config!.id, request)
      : this.chargeConfigService.createChargeConfig(this.data.portfolioId, currentUser.id, request);

    operation.subscribe({
      next: () => {
        this.snackBar.open(
          `Configuration ${this.isEditMode ? 'updated' : 'created'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error saving configuration:', error);
        this.snackBar.open(
          error.error?.message || `Error ${this.isEditMode ? 'updating' : 'creating'} configuration`,
          'Close',
          { duration: 5000 }
        );
        this.saving.set(false);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
