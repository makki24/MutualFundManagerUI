# Angular UI Project Context for QODO Gen

## 📋 Project Overview

This document provides complete context for developing the **Angular frontend** for the **Mutual Fund Manager** application. The Spring Boot backend is already complete and running.

---

## 🎯 Project Requirements

### **Core Functionality Needed:**

#### **1. Authentication & User Management**
- **Login page** with username/email and password
- **Role-based access** (ADMIN vs USER)
- **Dashboard routing** based on user role
- **Logout functionality**
- **Password change feature**

#### **2. Admin Features**
- **Portfolio Management**
  - Create portfolios with initial investors
  - Add/remove users from portfolios
  - Manage portfolio settings and fees
- **Share Trading**
  - Buy/sell shares with remaining cash
  - Update share prices manually
  - Add new holdings to portfolios
- **User Management**
  - Create/edit/deactivate users
  - View user investment summaries
- **Fee Management**
  - Calculate and distribute management fees
  - View charge breakdowns

#### **3. User Features**
- **Portfolio Dashboard**
  - View portfolio list with NAV, units, total value
  - View total returns: (current NAV - invested NAV) × units - charges
  - View investment performance
- **Transaction History**
  - View transaction history for each portfolio
  - Filter by date, type, portfolio
- **Investment Summary**
  - Total invested, current value, returns
  - Charges breakdown

---

## 🔗 Backend API Integration

### **Base URL:** `http://localhost:8080/api`

### **Key Endpoints Available:**

#### **Authentication:**
```bash
POST /auth/login
POST /auth/logout
POST /auth/change-password
```

#### **Dashboard Data:**
```bash
GET /dashboard/admin          # Admin overview
GET /dashboard/user/{userId}  # User dashboard
GET /dashboard/portfolio/{portfolioId}
GET /dashboard/market        # Market overview
```

#### **User Management:**
```bash
GET /users                   # All users
POST /users                  # Create user
PUT /users/{id}             # Update user
PATCH /users/{id}/activate  # Activate user
PATCH /users/{id}/deactivate # Deactivate user
```

#### **Portfolio Management:**
```bash
GET /portfolios             # All portfolios
POST /portfolios           # Create portfolio
GET /portfolios/{id}       # Portfolio details
POST /portfolios/{id}/users/{userId}/invest    # Add user investment
POST /portfolios/{id}/users/{userId}/withdraw  # User withdrawal
POST /portfolios/{id}/nav/update              # Update NAV
POST /portfolios/{id}/fees/calculate          # Calculate fees
```

#### **Holdings Management:**
```bash
GET /portfolios/{id}/holdings                    # Portfolio holdings
POST /portfolios/{id}/holdings                   # Add holding
POST /portfolios/{id}/holdings/symbol/{symbol}/buy   # Buy shares
POST /portfolios/{id}/holdings/symbol/{symbol}/sell  # Sell shares
PUT /portfolios/{id}/holdings/prices             # Update prices
POST /holdings/prices/update-all                 # Update all prices (placeholder)
```

#### **Investments & Transactions:**
```bash
GET /investments/user/{userId}                   # User investments
GET /investments/user/{userId}/summary           # Investment summary
GET /transactions/user/{userId}                 # User transactions
GET /transactions/portfolio/{portfolioId}       # Portfolio transactions
```

---

## 🎨 UI/UX Requirements

### **Design Guidelines:**
- **Modern Material Design** using Angular Material
- **Responsive layout** for desktop and mobile
- **Professional color scheme** suitable for financial application
- **Clean, intuitive navigation**
- **Loading states** and proper error handling
- **Form validation** with clear error messages

### **Key Components Needed:**

#### **1. Authentication Module**
- Login component with form validation
- Route guards for protected routes
- Auth service for token management

#### **2. Dashboard Module**
- Admin dashboard with overview cards
- User dashboard with investment summary
- Portfolio performance charts (optional)

#### **3. Portfolio Module**
- Portfolio list with search/filter
- Portfolio details with holdings
- Create/edit portfolio forms
- Investment/withdrawal forms

#### **4. User Module**
- User list with search/filter
- Create/edit user forms
- User investment summary

#### **5. Transaction Module**
- Transaction history with pagination
- Transaction filters (date, type, portfolio)
- Transaction details view

#### **6. Holdings Module**
- Holdings list with current prices
- Buy/sell share forms
- Price update functionality

---

## 🏗️ Suggested Project Structure

```
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── services/
│   └── models/
├── shared/
│   ├── components/
│   ├── directives/
│   └── pipes/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── portfolios/
│   ├── users/
│   ├── transactions/
│   └── holdings/
└── layout/
    ├── header/
    ├── sidebar/
    └── footer/
```

---

## 📊 Sample API Responses

### **Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mutualfund.com",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "ADMIN"
  },
  "token": "dummy-jwt-token-1"
}
```

### **User Dashboard Response:**
```json
{
  "investmentSummary": {
    "userId": 2,
    "portfolioCount": 3,
    "totalInvested": 25000.00,
    "currentValue": 28500.00,
    "totalCharges": 250.00,
    "totalReturns": 3250.00,
    "returnPercentage": 12.87
  },
  "activeInvestments": [...],
  "topInvestments": [...],
  "recentTransactionsCount": 15
}
```

### **Portfolio List Response:**
```json
[
  {
    "id": 1,
    "name": "Growth Portfolio",
    "navValue": 12.5000,
    "totalAum": 1000000.00,
    "totalUnits": 80000.0000,
    "remainingCash": 50000.00,
    "totalInvestors": 25,
    "totalHoldings": 10,
    "createdBy": {"id": 1, "username": "admin"}
  }
]
```

---

## 🔧 Technical Setup

### **Dependencies to Install:**
```bash
npm install @angular/material @angular/cdk @angular/animations
npm install @angular/flex-layout
npm install chart.js ng2-charts  # For charts (optional)
npm install moment  # For date handling
```

### **Angular Material Modules Needed:**
- MatToolbarModule
- MatSidenavModule
- MatButtonModule
- MatIconModule
- MatCardModule
- MatTableModule
- MatPaginatorModule
- MatFormFieldModule
- MatInputModule
- MatSelectModule
- MatDatepickerModule
- MatDialogModule
- MatSnackBarModule
- MatProgressSpinnerModule

---

## 🚀 Development Priorities

### **Phase 1: Core Setup**
1. ✅ Project structure setup
2. ✅ Angular Material installation
3. ✅ Routing configuration
4. ✅ Authentication module
5. ✅ Basic layout (header, sidebar)

### **Phase 2: Authentication & Navigation**
1. ✅ Login component with validation
2. ✅ Auth service with API integration
3. ✅ Route guards
4. ✅ Role-based navigation

### **Phase 3: Dashboard & Core Features**
1. ✅ Admin dashboard
2. ✅ User dashboard
3. ✅ Portfolio list and details
4. ✅ Basic CRUD operations

### **Phase 4: Advanced Features**
1. ✅ Transaction history
2. ✅ Holdings management
3. ✅ Investment/withdrawal flows
4. ✅ Price updates

---

## 🧪 Test Credentials

### **Backend Test Data:**
- **Admin:** username=`admin`, password=`admin123`
- **Users:** username=`john_doe`, `jane_smith`, `bob_wilson`, password=`password123`

### **Sample Portfolio:**
- **Name:** "Growth Portfolio"
- **NAV:** 12.5000
- **Holdings:** AAPL, GOOGL, MSFT
- **Investors:** john_doe, jane_smith, bob_wilson

---

## 🎯 Success Criteria

### **Must Have:**
- ✅ Secure login/logout
- ✅ Role-based dashboards
- ✅ Portfolio management (admin)
- ✅ Investment tracking (user)
- ✅ Transaction history
- ✅ Responsive design

### **Nice to Have:**
- 📊 Charts and graphs
- 🔍 Advanced search/filtering
- 📱 Mobile-optimized UI
- 🎨 Dark/light theme toggle
- 📈 Real-time price updates

---

## 📞 Backend Status

✅ **Spring Boot backend is COMPLETE and RUNNING**
✅ **All APIs are tested and working**
✅ **CORS configured for Angular development**
✅ **Test data seeded and ready**
✅ **Authentication endpoints ready**

**Backend runs on:** `http://localhost:8080`
**Angular should run on:** `http://localhost:4200`

---

## 🎯 Your Mission

Create a **professional, user-friendly Angular application** that:
1. **Integrates seamlessly** with the existing Spring Boot APIs
2. **Provides excellent UX** for both admin and regular users
3. **Handles all the mutual fund management requirements**
4. **Looks modern and professional**

**Start with the login page and authentication, then build out the dashboards and core features step by step.**

Good luck! 🚀
