import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-background">
        <div class="background-pattern"></div>
      </div>

      <div class="login-content">
        <mat-card class="login-card">
          <div class="card-header">
            <div class="logo-section">
              <div class="logo-wrapper">
                <mat-icon class="logo-icon">account_balance</mat-icon>
              </div>
              <div class="brand-info">
                <h1>Mutual Fund Manager</h1>
                <p>Professional Portfolio Management</p>
              </div>
            </div>
          </div>

          <mat-card-content class="card-content">
            <div class="welcome-text">
              <h2>Welcome Back</h2>
              <p>Sign in to access your dashboard</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Username or Email</mat-label>
                <input matInput formControlName="username" type="text" autocomplete="username" placeholder="Enter your username or email">
                <mat-icon matSuffix class="field-icon">person_outline</mat-icon>
                @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                  <mat-error>Username or email is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Password</mat-label>
                <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" autocomplete="current-password" placeholder="Enter your password">
                <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button" class="visibility-toggle">
                  <mat-icon class="field-icon">{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                  <mat-error>Password is required</mat-error>
                }
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" class="login-button"
                      [disabled]="loginForm.invalid || isLoading">
                @if (isLoading) {
                  <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                  <span>Signing in...</span>
                } @else {
                  <mat-icon>login</mat-icon>
                  <span>Sign In</span>
                }
              </button>
            </form>
          </mat-card-content>

          <mat-card-footer class="card-footer">
            <div class="test-credentials">
              <div class="credentials-header">
                <mat-icon>info_outline</mat-icon>
                <span>Demo Credentials</span>
              </div>
              <div class="credentials-list">
                <div class="credential-item">
                  <span class="role">Admin:</span>
                  <span class="creds">admin / admin123</span>
                </div>
                <div class="credential-item">
                  <span class="role">User:</span>
                  <span class="creds">john_doe / password123</span>
                </div>
              </div>
            </div>
          </mat-card-footer>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }

    .login-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
      z-index: 0;
    }

    .background-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%);
      background-size: 400px 400px;
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(1deg); }
    }

    .login-content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 450px;
      padding: 20px;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }

    .card-header {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      padding: 32px 32px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .logo-wrapper {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(25, 118, 210, 0.3);
    }

    .logo-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .brand-info h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }

    .brand-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
      font-weight: 400;
    }

    .card-content {
      padding: 32px;
    }

    .welcome-text {
      text-align: center;
      margin-bottom: 32px;
    }

    .welcome-text h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .welcome-text p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-field {
      width: 100%;
    }

    .form-field .mat-mdc-form-field-outline {
      border-radius: 12px;
    }

    .form-field .mat-mdc-text-field-wrapper {
      border-radius: 12px;
    }

    .field-icon {
      color: #666;
      font-size: 20px;
    }

    .visibility-toggle {
      border: none;
      background: none;
    }

    .login-button {
      width: 100%;
      height: 52px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 8px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
      transition: all 0.3s ease;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
    }

    .login-button:disabled {
      opacity: 0.7;
      transform: none;
      box-shadow: 0 4px 16px rgba(25, 118, 210, 0.2);
    }

    .button-spinner {
      margin-right: 8px;
    }

    .card-footer {
      background: #f8f9fa;
      padding: 24px 32px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .test-credentials {
      text-align: center;
    }

    .credentials-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .credentials-header mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .credentials-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .credential-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .credential-item .role {
      font-weight: 600;
      color: #1976d2;
      font-size: 13px;
    }

    .credential-item .creds {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #666;
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .login-content {
        padding: 16px;
        max-width: 100%;
      }

      .card-header {
        padding: 24px 24px 20px;
      }

      .card-content {
        padding: 24px;
      }

      .card-footer {
        padding: 20px 24px;
      }

      .brand-info h1 {
        font-size: 24px;
      }

      .welcome-text h2 {
        font-size: 20px;
      }
    }

    @media (max-width: 480px) {
      .credential-item {
        flex-direction: column;
        gap: 4px;
        text-align: center;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.error?.message || 'Login failed. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
