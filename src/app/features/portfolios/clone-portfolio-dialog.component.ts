import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

interface CloneDialogData {
  portfolioName: string;
  portfolioId: number;
}

@Component({
  selector: 'app-clone-portfolio-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Clone Portfolio</h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <div class="clone-info">
        <div class="source-portfolio">
          <mat-icon>pie_chart</mat-icon>
          <div>
            <h4>Cloning from:</h4>
            <p>{{ data.portfolioName }}</p>
          </div>
        </div>
        
        <mat-icon class="arrow-icon">arrow_forward</mat-icon>
        
        <div class="target-portfolio">
          <mat-icon>content_copy</mat-icon>
          <div>
            <h4>New portfolio:</h4>
            <p class="new-name-preview">{{ getNewPortfolioName() || 'Enter name below' }}</p>
          </div>
        </div>
      </div>

      <form [formGroup]="cloneForm" class="clone-form">
        <mat-form-field appearance="outline" class="form-field full-width">
          <mat-label>New Portfolio Name</mat-label>
          <input matInput formControlName="newPortfolioName" 
                 placeholder="Enter name for the cloned portfolio"
                 (input)="updatePreview()">
          <mat-icon matSuffix>content_copy</mat-icon>
          @if (cloneForm.get('newPortfolioName')?.hasError('required') && cloneForm.get('newPortfolioName')?.touched) {
            <mat-error>Portfolio name is required</mat-error>
          }
          @if (cloneForm.get('newPortfolioName')?.hasError('minlength') && cloneForm.get('newPortfolioName')?.touched) {
            <mat-error>Portfolio name must be at least 3 characters long</mat-error>
          }
        </mat-form-field>

        <div class="info-note">
          <mat-icon>info</mat-icon>
          <span>The cloned portfolio will include all holdings, transactions, user investments, fees, and charges from the original portfolio.</span>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button mat-dialog-close [disabled]="isLoading">Cancel</button>
      <button mat-raised-button color="primary" (click)="onClone()"
              [disabled]="cloneForm.invalid || isLoading">
        @if (isLoading) {
          <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
          <span>Cloning...</span>
        } @else {
          <ng-container>
            <mat-icon>content_copy</mat-icon>
            <span>Clone Portfolio</span>
          </ng-container>
        }
      </button>
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
      min-width: 500px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .clone-info {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }

    .source-portfolio, .target-portfolio {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .source-portfolio mat-icon {
      color: #1976d2;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .target-portfolio mat-icon {
      color: #4caf50;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .arrow-icon {
      color: #666;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .source-portfolio h4, .target-portfolio h4 {
      margin: 0 0 4px 0;
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .source-portfolio p, .target-portfolio p {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }

    .new-name-preview {
      color: #666 !important;
      font-style: italic;
    }

    .new-name-preview.has-value {
      color: #1a1a1a !important;
      font-style: normal;
    }

    .clone-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .info-note {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #e3f2fd;
      border: 1px solid #bbdefb;
      border-radius: 8px;
      color: #1565c0;
      font-size: 14px;
      line-height: 1.4;
    }

    .info-note mat-icon {
      color: #2196f3;
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-top: 2px;
      flex-shrink: 0;
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

      .clone-info {
        flex-direction: column;
        gap: 16px;
      }

      .arrow-icon {
        transform: rotate(90deg);
      }
    }
  `]
})
export class ClonePortfolioDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ClonePortfolioDialogComponent>);

  cloneForm: FormGroup;
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CloneDialogData) {
    this.cloneForm = this.fb.group({
      newPortfolioName: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Set default name as "Copy of [Original Name]"
    const defaultName = `Copy of ${this.data.portfolioName}`;
    this.cloneForm.patchValue({ newPortfolioName: defaultName });
  }

  getNewPortfolioName(): string {
    return this.cloneForm.get('newPortfolioName')?.value || '';
  }

  updatePreview(): void {
    // This method is called on input to trigger change detection for the preview
    const previewElement = document.querySelector('.new-name-preview');
    if (previewElement) {
      const hasValue = this.getNewPortfolioName().trim().length > 0;
      if (hasValue) {
        previewElement.classList.add('has-value');
      } else {
        previewElement.classList.remove('has-value');
      }
    }
  }

  onClone(): void {
    if (this.cloneForm.valid) {
      const newPortfolioName = this.cloneForm.get('newPortfolioName')?.value;
      this.dialogRef.close({ newPortfolioName });
    }
  }
}
