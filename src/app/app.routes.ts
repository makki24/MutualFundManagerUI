import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'portfolios',
        loadComponent: () => import('./features/portfolios/portfolio-list.component').then(m => m.PortfolioListComponent)
      },
      {
        path: 'portfolios/:id',
        loadComponent: () => import('./features/portfolios/portfolio-details/portfolio-details.component').then(m => m.PortfolioDetailsComponent)
      },
      {
        path: 'portfolios/:id/fees',
        loadComponent: () => import('./features/portfolios/portfolio-fees/portfolio-fees.component').then(m => m.PortfolioFeesComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list.component').then(m => m.UserListComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'holdings',
        loadComponent: () => import('./features/holdings/holdings-list.component').then(m => m.HoldingsListComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/transactions/transaction-list.component').then(m => m.TransactionListComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
