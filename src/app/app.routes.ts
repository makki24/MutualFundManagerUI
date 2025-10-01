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
        path: 'price-history',
        loadComponent: () => import('./features/price-history/price-history-page.component').then(m => m.PriceHistoryPageComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/transactions/transactions-page/transactions-page.component').then(m => m.TransactionsPageComponent)
      },
      {
        path: 'transactions/portfolio/:portfolioId',
        loadComponent: () => import('./features/transactions/transactions-page/transactions-page.component').then(m => m.TransactionsPageComponent)
      },
      {
        path: 'transaction-charges',
        loadComponent: () => import('./features/transaction-charges/transaction-charges-page.component').then(m => m.TransactionChargesPageComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'transaction-charges/:portfolioId',
        loadComponent: () => import('./features/transaction-charges/transaction-charges-page.component').then(m => m.TransactionChargesPageComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'database',
        loadComponent: () => import('./features/database/database-management/database-management.component').then(m => m.DatabaseManagementComponent),
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
