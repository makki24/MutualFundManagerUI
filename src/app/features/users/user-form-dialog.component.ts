import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

import { UserService } from '../../core/services/user.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../core/models/user.model';

interface DialogData {
  mode: 'create' | 'edit' | 'view';
  user?: User;
}

@Component({
  selector: 'app-user-form-dialog',
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
    MatDividerModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        @switch (data.mode) {
          @case ('create') { Add New User }
          @case ('edit') { Edit User }
          @case ('view') { User Details }
        }
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      @if (data.mode === 'view') {
        <!-- View Mode -->
        <div class="user-details">
          <div class="user-header">
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
            <div class="user-info">
              <h3>{{ data.user?.firstName }} {{ data.user?.lastName }}</h3>
              <p>{{ data.user?.username }}</p>
              <div class="user-badges">
                <span class="role-badge" [class]="data.user?.role?.toLowerCase()">
                  {{ data.user?.role }}
                </span>
                <span class="status-badge" [class]="data.user?.active ? 'active' : 'inactive'">
                  {{ data.user?.active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="details-grid">
            <div class="detail-item">
              <label>Email</label>
              <span>{{ data.user?.email }}</span>
            </div>
            <div class="detail-item">
              <label>Username</label>
              <span>{{ data.user?.username }}</span>
            </div>
            <div class="detail-item">
              <label>First Name</label>
              <span>{{ data.user?.firstName }}</span>
            </div>
            <div class="detail-item">
              <label>Last Name</label>
              <span>{{ data.user?.lastName }}</span>
            </div>
            <div class="detail-item">
              <label>Role</label>
              <span>{{ data.user?.role }}</span>
            </div>
            <div class="detail-item">
              <label>Status</label>
              <span>{{ data.user?.active ? 'Active' : 'Inactive' }}</span>
            </div>
            <div class="detail-item">
              <label>Created</label>
              <span>{{ data.user?.createdAt | date:'medium' }}</span>
            </div>
            <div class="detail-item">
              <label>Last Updated</label>
              <span>{{ data.user?.updatedAt | date:'medium' }}</span>
            </div>
          </div>
        </div>
      } @else {
        <!-- Form Mode -->
        <form [formGroup]="userForm" class="user-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" placeholder="Enter first name">
              <mat-icon matSuffix>person</mat-icon>
              @if (userForm.get('firstName')?.hasError('required') && userForm.get('firstName')?.touched) {
                <mat-error>First name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" placeholder="Enter last name">
              <mat-icon matSuffix>person</mat-icon>
              @if (userForm.get('lastName')?.hasError('required') && userForm.get('lastName')?.touched) {
                <mat-error>Last name is required</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="Enter username">
            <mat-icon matSuffix>account_circle</mat-icon>
            @if (userForm.get('username')?.hasError('required') && userForm.get('username')?.touched) {
              <mat-error>Username is required</mat-error>
            }
            @if (userForm.get('username')?.hasError('minlength') && userForm.get('username')?.touched) {
              <mat-error>Username must be at least 3 characters long</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Enter email address">
            <mat-icon matSuffix>email</mat-icon>
            @if (userForm.get('email')?.hasError('required') && userForm.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (userForm.get('email')?.hasError('email') && userForm.get('email')?.touched) {
              <mat-error>Please enter a valid email address</mat-error>
            }
          </mat-form-field>

          @if (data.mode === 'create') {
            <mat-form-field appearance="outline" class="form-field full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'"
                     placeholder="Enter password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (userForm.get('password')?.hasError('required') && userForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (userForm.get('password')?.hasError('minlength') && userForm.get('password')?.touched) {
                <mat-error>Password must be at least 8 characters long</mat-error>
              }
            </mat-form-field>
          }

          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Phone (Optional)</mat-label>
              <input matInput formControlName="phone" placeholder="Enter phone number">
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option value="USER">User</mat-option>
                <mat-option value="ADMIN">Admin</mat-option>
              </mat-select>
              <mat-icon matSuffix>security</mat-icon>
              @if (userForm.get('role')?.hasError('required') && userForm.get('role')?.touched) {
                <mat-error>Role is required</mat-error>
              }
            </mat-form-field>
          </div>
        </form>
      }
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      @if (data.mode === 'view') {
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary" (click)="editUser()">
          <mat-icon>edit</mat-icon>
          Edit User
        </button>
      } @else {
        <button mat-button mat-dialog-close [disabled]="isLoading">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSubmit()"
                [disabled]="userForm.invalid || isLoading">
          @if (isLoading) {
            <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
            <span>{{ data.mode === 'create' ? 'Creating...' : 'Updating...' }}</span>
          } @else {
            <ng-container>
              <mat-icon>{{ data.mode === 'create' ? 'person_add' : 'save' }}</mat-icon>
              <span>{{ data.mode === 'create' ? 'Create User' : 'Update User' }}</span>
            </ng-container>
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
      min-width: 500px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .user-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 24px;
    }

    .user-info h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .user-info p {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }

    .user-badges {
      display: flex;
      gap: 8px;
    }

    .role-badge, .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-badge.admin {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    .role-badge.user {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .status-badge.active {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .status-badge.inactive {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
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

    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
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

    @media (max-width: 600px) {
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

      .form-row {
        flex-direction: column;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<UserFormDialogComponent>);

  userForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.user) {
      this.populateForm(this.data.user);
    }
  }

  private createForm(): FormGroup {
    if (this.data.mode === 'create') {
      return this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        role: ['USER', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]]
      });
    } else {
      return this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        role: ['USER', [Validators.required]]
      });
    }
  }

  private populateForm(user: User): void {
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
  }

  getUserInitials(): string {
    if (this.data.user) {
      return `${this.data.user.firstName.charAt(0)}${this.data.user.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }

  editUser(): void {
    this.data.mode = 'edit';
    if (this.data.user) {
      this.populateForm(this.data.user);
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;

      if (this.data.mode === 'create') {
        this.createUser();
      } else if (this.data.mode === 'edit') {
        this.updateUser();
      }
    }
  }

  private createUser(): void {
    const request: CreateUserRequest = this.userForm.value;

    this.userService.createUser(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.snackBar.open('User created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message || 'Failed to create user. Please try again.',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  private updateUser(): void {
    if (!this.data.user) return;

    const request: UpdateUserRequest = this.userForm.value;

    this.userService.updateUser(this.data.user.id, request).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.snackBar.open('User updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message || 'Failed to update user. Please try again.',
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
