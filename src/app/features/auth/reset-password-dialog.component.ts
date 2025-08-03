import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { ResetPasswordRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-reset-password-dialog',
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
      <h2 mat-dialog-title>Reset Password</h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <div class="reset-info">
        <mat-icon class="info-icon">info_outline</mat-icon>
        <p>Enter the email address and new password for the account you want to reset.</p>
      </div>

      <form [formGroup]="resetForm" class="reset-form">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Email Address</mat-label>
          <input matInput formControlName="email" type="email"
                 autocomplete="email" placeholder="Enter email address">
          <mat-icon matSuffix>email</mat-icon>
          @if (resetForm.get('email')?.hasError('required') && resetForm.get('email')?.touched) {
            <mat-error>Email is required</mat-error>
          }
          @if (resetForm.get('email')?.hasError('email') && resetForm.get('email')?.touched) {
            <mat-error>Please enter a valid email address</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>New Password</mat-label>
          <input matInput formControlName="newPassword" [type]="hidePassword ? 'password' : 'text'"
                 autocomplete="new-password" placeholder="Enter new password">
          <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
            <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          @if (resetForm.get('newPassword')?.hasError('required') && resetForm.get('newPassword')?.touched) {
            <mat-error>New password is required</mat-error>
          }
          @if (resetForm.get('newPassword')?.hasError('minlength') && resetForm.get('newPassword')?.touched) {
            <mat-error>Password must be at least 8 characters long</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button mat-dialog-close [disabled]="isLoading">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()"
              [disabled]="resetForm.invalid || isLoading">
        @if (isLoading) {
          <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
          <span>Resetting...</span>
        } @else {
          <mat-icon>refresh</mat-icon>
          <span>Reset Password</span>
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
      min-width: 400px;
    }

    .reset-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 24px;
      padding: 16px;
      background: rgba(33, 150, 243, 0.1);
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .info-icon {
      color: #2196f3;
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-top: 2px;
    }

    .reset-info p {
      margin: 0;
      color: #1a1a1a;
      font-size: 14px;
      line-height: 1.5;
    }

    .reset-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-field {
      width: 100%;
    }

    .form-field .mat-mdc-form-field-outline {
      border-radius: 8px;
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

    @media (max-width: 480px) {
      .dialog-content {
        min-width: 300px;
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
    }
  `]
})
export class ResetPasswordDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ResetPasswordDialogComponent>);

  resetForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor() {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      this.isLoading = true;

      const request: ResetPasswordRequest = {
        email: this.resetForm.value.email,
        newPassword: this.resetForm.value.newPassword
      };

      this.authService.resetPassword(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.snackBar.open('Password reset successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close(true);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message || 'Failed to reset password. Please try again.',
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
}
