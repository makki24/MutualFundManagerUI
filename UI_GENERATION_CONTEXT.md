# Mutual Fund Manager - UI Generation Context

## Project Overview

The Mutual Fund Manager is a comprehensive web application for managing mutual fund portfolios, user investments, share trading, and financial transactions. This document provides complete context for generating a modern, responsive Angular frontend.

## Application Architecture

### Backend Technology Stack
- **Framework**: Spring Boot 3.x
- **Database**: PostgreSQL
- **API Style**: RESTful APIs
- **Authentication**: Basic authentication (to be enhanced with JWT)
- **Base URL**: `http://localhost:8080`

### Frontend Requirements
- **Framework**: Angular 17+
- **UI Library**: Angular Material or PrimeNG
- **Styling**: Modern, responsive design
- **State Management**: Angular Services with RxJS
- **Charts**: Chart.js or ng2-charts for financial data visualization

## Core Business Entities

### 1. User Management
- **Roles**: ADMIN, USER
- **Fields**: id, username, email, firstName, lastName, phone, role, isActive
- **Features**: Registration, login, profile management, user search

### 2. Portfolio Management
- **Core Fields**: id, name, description, navValue, totalAum, totalUnits, remainingCash
- **Fee Structure**: managementFeePercentage, entryLoadPercentage, exitLoadPercentage, brokerageBuyPercentage, brokerageSellPercentage
- **Calculated Fields**: totalHoldingsValue, totalPortfolioValue, totalInvestors, totalHoldings

### 3. Portfolio Holdings (Stocks/Securities)
- **Fields**: id, portfolioId, symbol, companyName, quantity, buyPrice, currentPrice
- **Calculated Fields**: totalInvested, currentValue, unrealizedGainLoss, returnPercentage

### 4. User Investments
- **Fields**: id, userId, portfolioId, unitsHeld, totalInvested, averageNav
- **Calculated Fields**: currentValue, totalChargesPaid, totalReturns, returnPercentage, aumPercentage

### 5. Transactions
- **Types**: USER_INVESTMENT, USER_WITHDRAWAL, SHARE_BUY, SHARE_SELL, CASH_ADDITION, MANAGEMENT_FEE
- **Fields**: id, portfolioId, userId, transactionType, symbol, quantity, pricePerUnit, totalAmount, charges, netAmount
- **Audit Fields**: navBefore, navAfter, unitsBefore, unitsAfter, description, createdAt

## API Endpoints Structure

### Authentication APIs (`/auth`)
- `POST /auth/login` - User authentication
- `POST /auth/change-password` - Password change
- `POST /auth/reset-password` - Password reset
- `POST /auth/logout` - User logout

### User Management APIs (`/api/users`)
- `GET /api/users` - List users with filtering
- `GET /api/users/{id}` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `PATCH /api/users/{id}/activate` - Activate user
- `PATCH /api/users/{id}/deactivate` - Deactivate user
- `GET /api/users/stats` - User statistics

### Portfolio Management APIs (`/api/portfolios`)
- `GET /api/portfolios` - List portfolios with filtering
- `GET /api/portfolios/{id}` - Get portfolio details
- `POST /api/portfolios` - Create portfolio
- `POST /api/portfolios/{id}/users/{userId}/invest` - Add user investment
- `POST /api/portfolios/{id}/users/{userId}/withdraw` - Process withdrawal
- `POST /api/portfolios/{id}/cash` - Add cash to portfolio
- `POST /api/portfolios/{id}/nav/update` - Update NAV
- `POST /api/portfolios/{id}/fees/calculate` - Calculate management fees

### Portfolio Holdings APIs (`/api/portfolios/{id}/holdings`)
- `GET /api/portfolios/{id}/holdings` - List portfolio holdings
- `POST /api/portfolios/{id}/holdings` - Add new holding
- `POST /api/portfolios/{id}/holdings/symbol/{symbol}/buy` - Buy shares
- `POST /api/portfolios/{id}/holdings/symbol/{symbol}/sell` - Sell shares
- `PUT /api/portfolios/{id}/holdings/prices` - Update prices

### Investment APIs (`/api/investments`)
- `GET /api/investments/user/{userId}` - User investments
- `GET /api/investments/portfolio/{portfolioId}` - Portfolio investments
- `GET /api/investments/user/{userId}/summary` - Investment summary

### Transaction APIs (`/api/transactions`)
- `GET /api/transactions/portfolio/{portfolioId}` - Portfolio transactions
- `GET /api/transactions/user/{userId}` - User transactions
- `GET /api/transactions/portfolio/{portfolioId}/summary` - Transaction summary

### Dashboard APIs (`/api/dashboard`)
- `GET /api/dashboard/overview` - System overview
- `GET /api/dashboard/portfolio/{portfolioId}` - Portfolio dashboard

## User Roles & Permissions

### ADMIN Users Can:
- Create and manage portfolios
- Add/remove users from portfolios
- Buy/sell shares for portfolios
- Update share prices
- Add cash to portfolios
- Calculate and distribute management fees
- View all users and portfolios
- Manage user accounts

### USER (Investor) Users Can:
- View their portfolio investments
- View their transaction history
- View portfolio performance
- View portfolio holdings
- Update their profile
- Change password

## Key UI Components Needed

### 1. Authentication Module
- **Login Page**: Username/email and password fields
- **Change Password Dialog**: Current and new password
- **Reset Password Dialog**: Email and new password

### 2. Dashboard Module
- **Admin Dashboard**: System overview, portfolio statistics, user statistics
- **User Dashboard**: Personal investment summary, portfolio performance
- **Portfolio Dashboard**: Detailed portfolio view with holdings and performance

### 3. User Management Module (Admin Only)
- **User List**: Searchable table with filters (active/inactive, role)
- **User Form**: Create/edit user with validation
- **User Details**: View user profile and investment summary

### 4. Portfolio Management Module
- **Portfolio List**: Cards or table view with key metrics
- **Portfolio Details**: Comprehensive view with holdings, investors, transactions
- **Create Portfolio Form**: Multi-step form with initial investors
- **Portfolio Settings**: Edit portfolio parameters and fees

### 5. Holdings Management Module (Admin Only)
- **Holdings List**: Table with current prices, gains/losses
- **Add Holding Form**: Symbol, company name, quantity, prices
- **Buy/Sell Shares**: Transaction forms with price and quantity
- **Price Update**: Bulk price update interface

### 6. Investment Management Module
- **Investment List**: User's portfolio investments
- **Investment Details**: Detailed view with transaction history
- **Investment/Withdrawal Forms**: Amount input with fee calculations

### 7. Transaction Module
- **Transaction History**: Filterable table with pagination
- **Transaction Details**: Detailed transaction view
- **Transaction Summary**: Charts and statistics

### 8. Reports Module
- **Performance Charts**: Portfolio and investment performance over time
- **Holdings Allocation**: Pie charts showing portfolio composition
- **Fee Reports**: Management fees and charges breakdown

## UI/UX Requirements

### Design Principles
- **Modern Material Design**: Clean, professional appearance
- **Responsive Layout**: Mobile-first approach
- **Data Visualization**: Charts for financial data
- **Real-time Updates**: Live data refresh for prices and NAV
- **Accessibility**: WCAG 2.1 AA compliance

### Color Scheme
- **Primary**: Blue (#1976D2) - Trust and stability
- **Secondary**: Green (#388E3C) - Growth and profit
- **Accent**: Orange (#F57C00) - Attention and warnings
- **Error**: Red (#D32F2F) - Losses and errors
- **Success**: Green (#4CAF50) - Gains and success

### Key UI Patterns
- **Cards**: For portfolio summaries and statistics
- **Tables**: For detailed data lists with sorting/filtering
- **Forms**: Multi-step forms for complex operations
- **Dialogs**: For confirmations and quick actions
- **Charts**: Line charts for performance, pie charts for allocation
- **Badges**: For status indicators (active/inactive, profit/loss)

## Data Formatting Requirements

### Financial Data
- **Currency**: Display with 2 decimal places (₹1,234.56)
- **Percentages**: Display with 2 decimal places (12.34%)
- **Units**: Display with 4 decimal places (1,234.5678)
- **NAV**: Display with 4 decimal places (₹12.3456)

### Date/Time
- **Dates**: DD/MM/YYYY format
- **DateTime**: DD/MM/YYYY HH:mm:ss format
- **Relative Time**: "2 hours ago", "Yesterday" for recent transactions

### Status Indicators
- **Active/Inactive**: Green/Red badges
- **Profit/Loss**: Green/Red text with up/down arrows
- **Transaction Types**: Color-coded badges

## Error Handling & Validation

### Form Validation
- **Real-time Validation**: Show errors as user types
- **Required Fields**: Clear indicators for mandatory fields
- **Format Validation**: Email, phone, currency formats
- **Business Rules**: Custom validators for business logic

### Error Display
- **Toast Notifications**: For success/error messages
- **Inline Errors**: For form field errors
- **Error Pages**: For 404, 500 errors
- **Loading States**: Spinners and skeleton screens

### API Error Handling
- **Network Errors**: Retry mechanisms and offline indicators
- **Validation Errors**: Display field-specific errors
- **Business Logic Errors**: User-friendly error messages
- **Server Errors**: Generic error handling with support contact

## Navigation Structure

### Admin Navigation
```
Dashboard
├── Overview
├── Portfolio Management
│   ├── All Portfolios
│   ├── Create Portfolio
│   └── Portfolio Details
├── User Management
│   ├── All Users
│   ├── Create User
│   └── User Details
├── Holdings Management
│   ├── All Holdings
│   ├── Price Updates
│   └── Trading
├── Transactions
│   ├── All Transactions
│   └── Reports
└── Settings
    ├── Profile
    └── System Settings
```

### User Navigation
```
Dashboard
├── My Investments
├── Portfolio Details
├── Transaction History
├── Performance Reports
└── Profile
    ├── Personal Info
    └── Change Password
```

## Sample Data for Development

### Sample Portfolios
1. **Growth Portfolio**: High-growth stocks, 12.5% annual return
2. **Balanced Portfolio**: Mix of stocks and bonds, 8.2% annual return
3. **Conservative Portfolio**: Low-risk investments, 5.1% annual return

### Sample Holdings
- **AAPL**: Apple Inc., Technology sector
- **GOOGL**: Alphabet Inc., Technology sector
- **MSFT**: Microsoft Corp., Technology sector
- **TSLA**: Tesla Inc., Automotive sector
- **AMZN**: Amazon.com Inc., E-commerce sector

### Sample Users
- **Admin**: Full system access
- **John Doe**: Investor with multiple portfolios
- **Jane Smith**: New investor with single portfolio
- **Mike Johnson**: High-value investor

## Performance Requirements

### Loading Times
- **Page Load**: < 2 seconds
- **API Calls**: < 500ms
- **Chart Rendering**: < 1 second
- **Data Refresh**: < 3 seconds

### Data Management
- **Pagination**: 20-50 items per page
- **Caching**: Cache static data (user info, portfolio details)
- **Lazy Loading**: Load data on demand
- **Real-time Updates**: WebSocket for live price updates

## Security Considerations

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Automatic logout on inactivity
- **Password Policy**: Strong password requirements
- **Two-Factor Authentication**: Optional 2FA for admin users

### Authorization
- **Role-based Access**: Different UI based on user role
- **Route Guards**: Protect admin routes
- **API Security**: Include auth tokens in all requests
- **Data Validation**: Client-side and server-side validation

## Integration Points

### External APIs (Future)
- **Stock Price APIs**: Real-time price feeds
- **Market Data**: Historical price data
- **News APIs**: Financial news integration
- **Payment Gateways**: Online payment processing

### Reporting
- **PDF Generation**: Portfolio statements and reports
- **Excel Export**: Transaction and holding data
- **Email Notifications**: Investment confirmations and alerts
- **SMS Alerts**: Critical transaction notifications

## Development Guidelines

### Code Structure
- **Feature Modules**: Organize by business domain
- **Shared Components**: Reusable UI components
- **Services**: API integration and state management
- **Guards**: Route protection and authentication
- **Interceptors**: HTTP request/response handling

### Testing Requirements
- **Unit Tests**: Component and service testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Critical user journey testing
- **Performance Tests**: Load testing for data-heavy operations

### Build & Deployment
- **Environment Configs**: Dev, staging, production environments
- **Build Optimization**: Tree shaking and lazy loading
- **PWA Features**: Offline capability and push notifications
- **Docker Support**: Containerized deployment

This context provides comprehensive information for generating a professional, feature-rich Angular frontend for the Mutual Fund Manager application. The UI should be intuitive, responsive, and provide excellent user experience for both administrators and investors.
