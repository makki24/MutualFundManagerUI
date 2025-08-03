import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { UserFormDialogComponent } from './user-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDividerModule
  ],
  template: `
    <div class="user-list-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>User Management</h1>
          <p>Manage user accounts and permissions</p>
        </div>
        <button mat-raised-button color="primary" (click)="createUser()">
          <mat-icon>person_add</mat-icon>
          Add User
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search users</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by name, username, or email">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Role</mat-label>
              <mat-select [formControl]="roleFilter">
                <mat-option value="">All Roles</mat-option>
                <mat-option value="ADMIN">Admin</mat-option>
                <mat-option value="USER">User</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="statusFilter">
                <mat-option value="">All Status</mat-option>
                <mat-option value="true">Active</mat-option>
                <mat-option value="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button (click)="clearFilters()" matTooltip="Clear filters">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Users Table -->
      <mat-card class="table-card">
        <mat-card-content>
          @if (isLoading) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
              <p>Loading users...</p>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="dataSource" matSort class="users-table">
                <!-- Avatar Column -->
                <ng-container matColumnDef="avatar">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let user">
                    <div class="user-avatar">
                      {{ getUserInitials(user) }}
                    </div>
                  </td>
                </ng-container>

                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="user-info">
                      <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="user-username">{{ user.username }}</div>
                    </div>
                  </td>
                </ng-container>

                <!-- Email Column -->
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                  <td mat-cell *matCellDef="let user">{{ user.email }}</td>
                </ng-container>

                <!-- Role Column -->
                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [class]="'role-chip ' + user.role.toLowerCase()">
                      {{ user.role }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [class]="'status-chip ' + (user.active ? 'active' : 'inactive')">
                      {{ user.active ? 'Active' : 'Inactive' }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Created Date Column -->
                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
                  <td mat-cell *matCellDef="let user">
                    {{ user.createdAt | date:'short' }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let user">
                    <button mat-icon-button [matMenuTriggerFor]="actionMenu"
                            [matMenuTriggerData]="{user: user}">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                    (click)="viewUser(row)" class="table-row"></tr>
              </table>

              @if (dataSource.data.length === 0) {
                <div class="no-data">
                  <mat-icon>people_outline</mat-icon>
                  <h3>No users found</h3>
                  <p>Try adjusting your search criteria or add a new user.</p>
                  <button mat-raised-button color="primary" (click)="createUser()">
                    <mat-icon>person_add</mat-icon>
                    Add First User
                  </button>
                </div>
              }
            </div>

            <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]"
                          [pageSize]="25"
                          showFirstLastButtons>
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Action Menu -->
    <mat-menu #actionMenu="matMenu">
      <ng-template matMenuContent let-user="user">
        <button mat-menu-item (click)="editUser(user)">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="viewUserDetails(user)">
          <mat-icon>visibility</mat-icon>
          <span>View Details</span>
        </button>
        <mat-divider></mat-divider>
        @if (user.active) {
          <button mat-menu-item (click)="deactivateUser(user)" class="warn-action">
            <mat-icon>block</mat-icon>
            <span>Deactivate</span>
          </button>
        } @else {
          <button mat-menu-item (click)="activateUser(user)" class="success-action">
            <mat-icon>check_circle</mat-icon>
            <span>Activate</span>
          </button>
        }
      </ng-template>
    </mat-menu>
  `,
  styles: [`
    .user-list-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .header-content p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .filter-field {
      min-width: 150px;
    }

    .table-card {
      overflow: hidden;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
    }

    .table-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-weight: 500;
      color: #1a1a1a;
    }

    .user-username {
      font-size: 12px;
      color: #666;
    }

    .role-chip {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-chip.admin {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    .role-chip.user {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .status-chip {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-chip.active {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .status-chip.inactive {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-data h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #1a1a1a;
    }

    .no-data p {
      margin: 0 0 24px 0;
      font-size: 14px;
    }

    .warn-action {
      color: #f44336;
    }

    .success-action {
      color: #4caf50;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field,
      .filter-field {
        min-width: auto;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<User>([]);
  displayedColumns = ['avatar', 'name', 'email', 'role', 'status', 'createdAt', 'actions'];
  isLoading = true;

  searchControl = new FormControl('');
  roleFilter = new FormControl('');
  statusFilter = new FormControl('');

  ngOnInit(): void {
    this.setupFilters();
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupFilters(): void {
    // Search filter
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Role filter
    this.roleFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Status filter
    this.statusFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    this.dataSource.filterPredicate = (user: User, filter: string) => {
      const searchTerm = this.searchControl.value?.toLowerCase() || '';
      const roleFilter = this.roleFilter.value || '';
      const statusFilter = this.statusFilter.value || '';

      const matchesSearch = !searchTerm ||
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm);

      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.active?.toString() === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    };

    this.dataSource.filter = 'trigger'; // Trigger filter
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.dataSource.data = response.data || [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  getUserInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.roleFilter.setValue('');
    this.statusFilter.setValue('');
  }

  createUser(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  viewUser(user: User): void {
    this.viewUserDetails(user);
  }

  viewUserDetails(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'view', user },
      disableClose: false
    });
  }

  activateUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Activate User',
        message: `Are you sure you want to activate ${user.firstName} ${user.lastName}?`,
        confirmText: 'Activate',
        confirmColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.activateUser(user.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('User activated successfully', 'Close', { duration: 3000 });
              this.loadUsers();
            }
          },
          error: (error) => {
            this.snackBar.open('Failed to activate user', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deactivateUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Deactivate User',
        message: `Are you sure you want to deactivate ${user.firstName} ${user.lastName}? They will no longer be able to access the system.`,
        confirmText: 'Deactivate',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deactivateUser(user.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('User deactivated successfully', 'Close', { duration: 3000 });
              this.loadUsers();
            }
          },
          error: (error) => {
            this.snackBar.open('Failed to deactivate user', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
