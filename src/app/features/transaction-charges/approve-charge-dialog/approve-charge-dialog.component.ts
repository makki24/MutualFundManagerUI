import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TransactionCharge } from '../../../core/models/transaction-charge.model';

@Component({
  selector: 'app-approve-charge-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>check_circle</mat-icon>
          Approve Charge
        </h2>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="charge-info">
          <div class="info-row">
            <span class="label">Portfolio:</span>
            <span class="value">{{ charge.portfolio.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">{{ charge.calculationDate | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Total Turnover:</span>
            <span class="value">₹{{ charge.totalTurnover | number:'1.2-2' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Calculated Charges:</span>
            <span class="value">₹{{ charge.totalCharges | number:'1.2-2' }}</span>
          </div>
        </div>

        <mat-divider></mat-divider>

        <form [formGroup]="approveForm" class="approve-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correction Amount (Optional)</mat-label>
            <input 
              matInput 
              type="number" 
              formControlName="correction"
              placeholder="0.00"
              step="0.01"
              #correctionInput>
            <span matTextPrefix>₹&nbsp;</span>
            <mat-icon matIconSuffix>edit</mat-icon>
            <mat-hint>Enter a correction amount if needed (can be positive or negative)</mat-hint>
            @if (approveForm.get('correction')?.hasError('min')) {
              <mat-error>Correction cannot be less than -{{ charge.totalCharges | number:'1.2-2' }}</mat-error>
            }
          </mat-form-field>

          @if (approveForm.get('correction')?.value !== null && approveForm.get('correction')?.value !== 0) {
            <div class="preview-section">
              <div class="preview-header">
                <mat-icon>preview</mat-icon>
                <span>Preview</span>
              </div>
              <div class="preview-details">
                <div class="preview-row">
                  <span class="label">Original Charges:</span>
                  <span class="value">₹{{ charge.totalCharges | number:'1.2-2' }}</span>
                </div>
                <div class="preview-row correction-row">
                  <span class="label">Correction:</span>
                  <span class="value" [class.positive]="getCorrectionValue() > 0" [class.negative]="getCorrectionValue() < 0">
                    {{ getCorrectionValue() >= 0 ? '+' : '' }}₹{{ getCorrectionValue() | number:'1.2-2' }}
                  </span>
                </div>
                <mat-divider></mat-divider>
                <div class="preview-row final-row">
                  <span class="label">Final Charges:</span>
                  <span class="value final-value">₹{{ getFinalCharges() | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          }
        </form>

        <div class="warning-message">
          <mat-icon>info</mat-icon>
          <span>Approving this charge will mark it as REVIEWED and ready to apply.</span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onApprove()"
          [disabled]="!approveForm.valid">
          <mat-icon>check_circle</mat-icon>
          Approve
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px 0;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .dialog-header mat-icon {
      color: #4caf50;
    }

    .close-button {
      margin-top: -8px;
    }

    mat-dialog-content {
      padding: 16px 24px;
      overflow-y: auto;
    }

    .charge-info {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
    }

    .value {
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
    }

    mat-divider {
      margin: 16px 0;
    }

    .approve-form {
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .preview-section {
      background: #e3f2fd;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-weight: 500;
      color: #1976d2;
    }

    .preview-header mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .preview-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .preview-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .correction-row .value {
      font-weight: 600;
    }

    .correction-row .value.positive {
      color: #4caf50;
    }

    .correction-row .value.negative {
      color: #f44336;
    }

    .final-row {
      margin-top: 8px;
      padding-top: 8px;
    }

    .final-row .label {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .final-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1976d2;
    }

    .warning-message {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 12px;
      margin-top: 16px;
      border-radius: 4px;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.7);
    }

    .warning-message mat-icon {
      color: #ff9800;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }

    mat-dialog-actions button {
      min-width: 100px;
    }

    /* Mobile responsive styles */
    @media (max-width: 768px) {
      .dialog-header {
        padding: 12px 16px 0;
      }

      .dialog-header h2 {
        font-size: 1.25rem;
      }

      mat-dialog-content {
        padding: 12px 16px;
      }

      .charge-info {
        padding: 12px;
      }

      .info-row {
        flex-direction: column;
        gap: 4px;
        margin-bottom: 12px;
      }

      .preview-section {
        padding: 12px;
      }

      .preview-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .final-row .label {
        font-size: 1rem;
      }

      .final-value {
        font-size: 1.1rem;
      }

      mat-dialog-actions {
        padding: 12px 16px;
        flex-direction: column-reverse;
      }

      mat-dialog-actions button {
        width: 100%;
        min-width: unset;
      }
    }
  `]
})
export class ApproveChargeDialogComponent implements OnInit {
  approveForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ApproveChargeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public charge: TransactionCharge
  ) {
    this.approveForm = this.fb.group({
      correction: [0, [Validators.min(-this.charge.totalCharges)]]
    });
  }

  ngOnInit(): void {
    // Auto-focus on correction input after a short delay
    setTimeout(() => {
      const correctionInput = document.querySelector('input[formControlName="correction"]') as HTMLInputElement;
      if (correctionInput) {
        correctionInput.focus();
        correctionInput.select();
      }
    }, 100);
  }

  getCorrectionValue(): number {
    return this.approveForm.get('correction')?.value || 0;
  }

  getFinalCharges(): number {
    return this.charge.totalCharges + this.getCorrectionValue();
  }

  onApprove(): void {
    if (this.approveForm.valid) {
      const correction = this.getCorrectionValue();
      this.dialogRef.close({ correction });
    }
  }
}
