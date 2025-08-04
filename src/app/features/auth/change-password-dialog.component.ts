import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { ChangePasswordRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-change-password-dialog',
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
      <h2 mat-dialog-title>Change Password</h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="passwordForm" class="password-form">
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Current Password</mat-label>
          <input matInput formControlName="oldPassword" [type]="hideOldPassword ? 'password' : 'text'"
                 autocomplete="current-password" placeholder="Enter your current password">
          <button mat-icon-button matSuffix (click)="hideOldPassword = !hideOldPassword" type="button">
            <mat-icon>{{hideOldPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          @if (passwordForm.get('oldPassword')?.hasError('required') && passwordForm.get('oldPassword')?.touched) {
            <mat-error>Current password is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>New Password</mat-label>
          <input matInput formControlName="newPassword" [type]="hideNewPassword ? 'password' : 'text'"
                 autocomplete="new-password" placeholder="Enter your new password">
          <button mat-icon-button matSuffix (click)="hideNewPassword = !hideNewPassword" type="button">
            <mat-icon>{{hideNewPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          @if (passwordForm.get('newPassword')?.hasError('required') && passwordForm.get('newPassword')?.touched) {
            <mat-error>New password is required</mat-error>
          }
          @if (passwordForm.get('newPassword')?.hasError('minlength') && passwordForm.get('newPassword')?.touched) {
            <mat-error>Password must be at least 8 characters long</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Confirm New Password</mat-label>
          <input matInput formControlName="confirmPassword" [type]="hideConfirmPassword ? 'password' : 'text'"
                 autocomplete="new-password" placeholder="Confirm your new password">
          <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
            <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
          </button>
          @if (passwordForm.get('confirmPassword')?.hasError('required') && passwordForm.get('confirmPassword')?.touched) {
            <mat-error>Please confirm your new password</mat-error>
          }
          @if (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmPassword')?.touched) {
            <mat-error>Passwords do not match</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button mat-dialog-close [disabled]="isLoading">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()"
              [disabled]="passwordForm.invalid || isLoading">
        @if (isLoading) {
          <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
          <span>Changing...</span>
        } @else {
          <ng-container>
            <mat-icon>lock</mat-icon>
            <span>Change Password</span>
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
      min-width: 400px;
    }

    .password-form {
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
export class ChangePasswordDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ChangePasswordDialogComponent>);

  passwordForm: FormGroup;
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { userId: number }) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;

      const request: ChangePasswordRequest = {
        userId: this.data.userId,
        oldPassword: this.passwordForm.value.oldPassword,
        newPassword: this.passwordForm.value.newPassword
      };

      this.authService.changePassword(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.snackBar.open('Password changed successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close(true);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message || 'Failed to change password. Please try again.',
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
