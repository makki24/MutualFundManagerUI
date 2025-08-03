import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="users-container">
      <div class="page-header">
        <h1>Users Management</h1>
        <button mat-raised-button color="primary" (click)="createUser()">
          <mat-icon>person_add</mat-icon>
          Add User
        </button>
      </div>

      @if (isLoading) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading users...</p>
        </div>
      } @else if (users.length > 0) {
        <mat-card>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="users" class="users-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="user-info">
                      <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="user-username">@{{ user.username }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let user">{{ user.email }}</td>
                </ng-container>

                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Role</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [class]="user.role.toLowerCase()">
                      {{ user.role }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [class]="user.active ? 'active' : 'inactive'">
                      {{ user.active ? 'Active' : 'Inactive' }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="created">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let user">
                    {{ user.createdAt | date:'short' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let user">
                    <button mat-icon-button color="primary" (click)="editUser(user)"
                            matTooltip="Edit User">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="viewInvestments(user)"
                            matTooltip="View Investments">
                      <mat-icon>pie_chart</mat-icon>
                    </button>
                    @if (user.active) {
                      <button mat-icon-button color="warn" (click)="deactivateUser(user)"
                              matTooltip="Deactivate User">
                        <mat-icon>block</mat-icon>
                      </button>
                    } @else {
                      <button mat-icon-button color="accent" (click)="activateUser(user)"
                              matTooltip="Activate User">
                        <mat-icon>check_circle</mat-icon>
                      </button>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="no-data">
          <mat-icon>people</mat-icon>
          <h3>No Users Found</h3>
          <p>There are no users in the system.</p>
          <button mat-raised-button color="primary" (click)="createUser()">
            <mat-icon>person_add</mat-icon>
            Add First User
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .users-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
      color: #333;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 500;
      font-size: 14px;
    }

    .user-username {
      font-size: 12px;
      color: #666;
    }

    mat-chip {
      font-size: 12px;
      font-weight: 500;
    }

    mat-chip.admin {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
    }

    mat-chip.user {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    mat-chip.active {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    mat-chip.inactive {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-data h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
    }

    .no-data p {
      margin: 0 0 24px 0;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .page-header h1 {
        text-align: center;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  users: User[] = [];
  isLoading = true;
  displayedColumns = ['name', 'email', 'role', 'status', 'created', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  createUser(): void {
    this.snackBar.open('Create user feature coming soon!', 'Close', { duration: 3000 });
  }

  editUser(user: User): void {
    this.snackBar.open(`Edit user ${user.username} feature coming soon!`, 'Close', { duration: 3000 });
  }

  viewInvestments(user: User): void {
    this.snackBar.open(`View investments for ${user.username} feature coming soon!`, 'Close', { duration: 3000 });
  }

  activateUser(user: User): void {
    this.userService.activateUser(user.id).subscribe({
      next: () => {
        this.snackBar.open(`User ${user.username} activated successfully`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Failed to activate user:', error);
        this.snackBar.open('Failed to activate user', 'Close', { duration: 5000 });
      }
    });
  }

  deactivateUser(user: User): void {
    this.userService.deactivateUser(user.id).subscribe({
      next: () => {
        this.snackBar.open(`User ${user.username} deactivated successfully`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Failed to deactivate user:', error);
        this.snackBar.open('Failed to deactivate user', 'Close', { duration: 5000 });
      }
    });
  }
}
