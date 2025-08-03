# Mutual Fund Manager - API Request/Response Structures & Error Handling

## Overview
This document provides comprehensive request/response structures and error handling patterns for all API endpoints in the Mutual Fund Manager application.

## Base Response Structure

All API responses follow a consistent structure using the `ApiResponse<T>` wrapper:

```json
{
  "success": boolean,
  "message": "string",
  "data": T | null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "string | null"
}
```

## Error Response Patterns

### Standard Error Codes
- **400 Bad Request**: Invalid input data, validation errors
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists or business rule violation
- **500 Internal Server Error**: Unexpected server errors

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Detailed error message"
}
```

---

## 🔐 Authentication APIs

### POST /auth/login

**Request:**
```json
{
  "username": "string", // Can be username or email
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john.doe@email.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00",
      "updatedAt": "2024-01-01T10:00:00"
    },
    "token": "dummy-jwt-token-1"
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

**Error Responses:**
- **401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Invalid credentials"
}
```

- **500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Internal server error"
}
```

### POST /auth/change-password

**Request:**
```json
{
  "userId": 1,
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

**Error Responses:**
- **400 Bad Request:**
```json
{
  "success": false,
  "message": "Failed to change password. Please check your old password.",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Failed to change password. Please check your old password."
}
```

### POST /auth/reset-password

**Request:**
```json
{
  "email": "string",
  "newPassword": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

**Error Responses:**
- **400 Bad Request:**
```json
{
  "success": false,
  "message": "Email not found",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Email not found"
}
```

### POST /auth/logout

**Request:** No body required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

---

## 👥 User Management APIs

### GET /api/users

**Query Parameters:**
- `activeOnly` (boolean, optional): Filter for active users only
- `role` (string, optional): Filter by role (ADMIN, USER)
- `search` (string, optional): Search by name, username, or email

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john.doe@email.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00",
      "updatedAt": "2024-01-01T10:00:00"
    }
  ],
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

**Error Responses:**
- **400 Bad Request (Invalid role):**
```json
{
  "success": false,
  "message": "Invalid role parameter",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Invalid role parameter"
}
```

### GET /api/users/{id}

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john.doe@email.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

**Error Responses:**
- **404 Not Found:**
```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "User not found"
}
```

### POST /api/users

**Request:**
```json
{
  "username": "new_user",
  "email": "user@email.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "USER"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "username": "new_user",
    "email": "user@email.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-01T10:00:00"
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

**Error Responses:**
- **400 Bad Request (Validation errors):**
```json
{
  "success": false,
  "message": "Username already exists",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Username already exists"
}
```

### PUT /api/users/{id}

**Request:** Same as POST /api/users

**Success Response (200):** Same as POST /api/users

### PATCH /api/users/{id}/deactivate

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### PATCH /api/users/{id}/activate

**Success Response (200):**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### GET /api/users/stats

**Success Response (200):**
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "activeUserCount": 25,
    "timestamp": 1704110400000
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

---

## 📊 Portfolio Management APIs

### GET /api/portfolios

**Query Parameters:**
- `activeOnly` (boolean, optional): Filter for active portfolios
- `search` (string, optional): Search by portfolio name
- `userId` (long, optional): Get portfolios for specific user

**Success Response (200):**
```json
{
  "success": true,
  "message": "Portfolios retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Growth Portfolio",
      "description": "High growth potential portfolio",
      "navValue": 12.5000,
      "totalAum": 1000000.00,
      "totalUnits": 80000.0000,
      "remainingCash": 50000.00,
      "managementFeePercentage": 0.0200,
      "entryLoadPercentage": 0.0100,
      "exitLoadPercentage": 0.0050,
      "brokerageBuyPercentage": 0.0025,
      "brokerageSellPercentage": 0.0025,
      "isActive": true,
      "createdBy": {
        "id": 1,
        "username": "admin"
      },
      "totalHoldingsValue": 950000.00,
      "totalPortfolioValue": 1000000.00,
      "totalInvestors": 25,
      "totalHoldings": 10
    }
  ],
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### GET /api/portfolios/{id}

**Success Response (200):**
```json
{
  "success": true,
  "message": "Portfolio retrieved successfully",
  "data": {
    "id": 1,
    "name": "Growth Portfolio",
    "description": "High growth potential portfolio",
    "navValue": 12.5000,
    "totalAum": 1000000.00,
    "totalUnits": 80000.0000,
    "remainingCash": 50000.00,
    "managementFeePercentage": 0.0200,
    "entryLoadPercentage": 0.0100,
    "exitLoadPercentage": 0.0050,
    "brokerageBuyPercentage": 0.0025,
    "brokerageSellPercentage": 0.0025,
    "isActive": true,
    "createdBy": {
      "id": 1,
      "username": "admin"
    },
    "totalHoldingsValue": 950000.00,
    "totalPortfolioValue": 1000000.00,
    "totalInvestors": 25,
    "totalHoldings": 10
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### POST /api/portfolios?createdByUserId={adminUserId}

**Request:**
```json
{
  "name": "New Portfolio",
  "description": "Portfolio description",
  "initialNavValue": 10.0000,
  "initialCash": 100000.00,
  "managementFeePercentage": 0.0200,
  "entryLoadPercentage": 0.0100,
  "exitLoadPercentage": 0.0050,
  "brokerageBuyPercentage": 0.0025,
  "brokerageSellPercentage": 0.0025,
  "initialInvestors": [
    {
      "userId": 2,
      "investmentAmount": 10000.00
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Portfolio created successfully",
  "data": {
    "id": 2,
    "name": "New Portfolio",
    "description": "Portfolio description",
    "navValue": 10.0000,
    "totalAum": 100000.00,
    "totalUnits": 10000.0000,
    "remainingCash": 90000.00,
    "managementFeePercentage": 0.0200,
    "entryLoadPercentage": 0.0100,
    "exitLoadPercentage": 0.0050,
    "brokerageBuyPercentage": 0.0025,
    "brokerageSellPercentage": 0.0025,
    "isActive": true,
    "createdBy": {
      "id": 1,
      "username": "admin"
    },
    "totalHoldingsValue": 0.00,
    "totalPortfolioValue": 100000.00,
    "totalInvestors": 1,
    "totalHoldings": 0
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### POST /api/portfolios/{portfolioId}/users/{userId}/invest?investmentAmount={amount}&adminUserId={adminId}

**Success Response (200):**
```json
{
  "success": true,
  "message": "User investment added successfully",
  "data": {
    // Updated portfolio data
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

**Error Responses:**
- **400 Bad Request:**
```json
{
  "success": false,
  "message": "Insufficient cash in portfolio",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Insufficient cash in portfolio"
}
```

### POST /api/portfolios/{portfolioId}/users/{userId}/withdraw?unitsToWithdraw={units}&adminUserId={adminId}

**Success Response (200):**
```json
{
  "success": true,
  "message": "User withdrawal processed successfully",
  "data": {
    // Updated portfolio data
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

---

## 📈 Portfolio Holdings APIs

### GET /api/portfolios/{portfolioId}/holdings

**Query Parameters:**
- `activeOnly` (boolean, optional): Filter for holdings with quantity > 0

**Success Response (200):**
```json
{
  "success": true,
  "message": "Portfolio holdings retrieved successfully",
  "data": [
    {
      "id": 1,
      "portfolioId": 1,
      "portfolioName": "Growth Portfolio",
      "symbol": "AAPL",
      "companyName": "Apple Inc.",
      "quantity": 100.0000,
      "buyPrice": 150.00,
      "currentPrice": 175.00,
      "lastPriceUpdate": "2024-01-01T15:30:00",
      "totalInvested": 15000.00,
      "currentValue": 17500.00,
      "unrealizedGainLoss": 2500.00,
      "returnPercentage": 16.67
    }
  ],
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### POST /api/portfolios/{portfolioId}/holdings?adminUserId={adminId}

**Request:**
```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "quantity": 100.0000,
  "buyPrice": 150.00,
  "currentPrice": 175.00
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Holding added successfully",
  "data": {
    "id": 2,
    "portfolioId": 1,
    "portfolioName": "Growth Portfolio",
    "symbol": "AAPL",
    "companyName": "Apple Inc.",
    "quantity": 100.0000,
    "buyPrice": 150.00,
    "currentPrice": 175.00,
    "lastPriceUpdate": "2024-01-01T15:30:00",
    "totalInvested": 15000.00,
    "currentValue": 17500.00,
    "unrealizedGainLoss": 2500.00,
    "returnPercentage": 16.67
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### POST /api/portfolios/{portfolioId}/holdings/symbol/{symbol}/buy?quantity={qty}&buyPrice={price}&adminUserId={adminId}

**Success Response (200):**
```json
{
  "success": true,
  "message": "Shares purchased successfully",
  "data": {
    // Updated holding data
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### POST /api/portfolios/{portfolioId}/holdings/symbol/{symbol}/sell?quantity={qty}&sellPrice={price}&adminUserId={adminId}

**Success Response (200):**
```json
{
  "success": true,
  "message": "Shares sold successfully",
  "data": {
    // Updated holding data
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### PUT /api/portfolios/{portfolioId}/holdings/prices

**Request:**
```json
{
  "priceUpdates": [
    {
      "symbol": "AAPL",
      "currentPrice": 180.00
    },
    {
      "symbol": "GOOGL",
      "currentPrice": 2800.00
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Prices updated successfully",
  "data": {
    "updatedCount": 2,
    "failedUpdates": []
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

---

## 💰 User Investment APIs

### GET /api/investments/user/{userId}

**Query Parameters:**
- `activeOnly` (boolean, optional): Filter for active investments

**Success Response (200):**
```json
{
  "success": true,
  "message": "User investments retrieved successfully",
  "data": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "username": "john_doe"
      },
      "portfolio": {
        "id": 1,
        "name": "Growth Portfolio"
      },
      "unitsHeld": 800.0000,
      "totalInvested": 8000.00,
      "averageNav": 10.0000,
      "currentValue": 10000.00,
      "totalChargesPaid": 80.00,
      "totalReturns": 1920.00,
      "returnPercentage": 23.76,
      "aumPercentage": 1.00
    }
  ],
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### GET /api/investments/portfolio/{portfolioId}

**Success Response (200):**
```json
{
  "success": true,
  "message": "Portfolio investments retrieved successfully",
  "data": [
    // Array of investment objects
  ],
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### GET /api/investments/user/{userId}/summary

**Success Response (200):**
```json
{
  "success": true,
  "message": "User investment summary retrieved successfully",
  "data": {
    "userId": 2,
    "portfolioCount": 3,
    "totalInvested": 25000.00,
    "currentValue": 28500.00,
    "totalCharges": 250.00,
    "totalReturns": 3250.00,
    "returnPercentage": 12.87
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

---

## 📋 Transaction APIs

### GET /api/transactions/portfolio/{portfolioId}

**Query Parameters:**
- `page` (int, optional): Page number for pagination
- `size` (int, optional): Page size for pagination
- `type` (string, optional): Filter by transaction type
- `symbol` (string, optional): Filter by symbol
- `startDate` (datetime, optional): Start date for date range filter
- `endDate` (datetime, optional): End date for date range filter

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": 1,
      "portfolioId": 1,
      "portfolioName": "Growth Portfolio",
      "user": {
        "id": 2,
        "username": "john_doe"
      },
      "transactionType": "USER_INVESTMENT",
      "symbol": null,
      "quantity": 800.0000,
      "pricePerUnit": 10.0000,
      "totalAmount": 8000.00,
      "charges": 80.00,
      "netAmount": 7920.00,
      "navBefore": 10.0000,
      "navAfter": 10.0000,
      "unitsBefore": 0.0000,
      "unitsAfter": 800.0000,
      "description": "Investment by John Doe - 800.0000 units at NAV 10.0000",
      "createdAt": "2024-01-01T10:00:00"
    }
  ],
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### GET /api/transactions/user/{userId}

**Success Response (200):** Same structure as portfolio transactions

### GET /api/transactions/portfolio/{portfolioId}/summary

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction summary retrieved successfully",
  "data": {
    "totalTransactions": 150,
    "totalInvestments": 50000.00,
    "totalWithdrawals": 10000.00,
    "totalCharges": 500.00,
    "totalBuyTransactions": 25,
    "totalSellTransactions": 15
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

---

## 📊 Dashboard APIs

### GET /api/dashboard/overview

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "totalPortfolios": 5,
    "totalUsers": 100,
    "totalAum": 5000000.00,
    "totalInvestments": 4500000.00,
    "totalReturns": 500000.00,
    "averageReturn": 11.11
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

### GET /api/dashboard/portfolio/{portfolioId}

**Success Response (200):**
```json
{
  "success": true,
  "message": "Portfolio dashboard retrieved successfully",
  "data": {
    "portfolio": {
      // Portfolio details
    },
    "recentTransactions": [
      // Recent transactions
    ],
    "topHoldings": [
      // Top holdings by value
    ],
    "performanceMetrics": {
      "totalReturn": 15.5,
      "monthlyReturn": 2.3,
      "yearlyReturn": 18.7,
      "volatility": 12.4
    }
  },
  "timestamp": "2024-01-01T10:00:00",
  "error": null
}
```

---

## Common Error Scenarios

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Field 'email' is required"
}
```

### Resource Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Portfolio with id 999 not found"
}
```

### Business Logic Errors (400)
```json
{
  "success": false,
  "message": "Business rule violation",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Insufficient units for withdrawal"
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "data": null,
  "timestamp": "2024-01-01T10:00:00",
  "error": "Database connection failed"
}
```

---

## Request Validation Rules

### User Creation/Update
- `username`: Required, 3-50 characters, alphanumeric and underscore only
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
- `firstName`: Required, 1-50 characters
- `lastName`: Required, 1-50 characters
- `phone`: Optional, valid phone format
- `role`: Required, must be "USER" or "ADMIN"

### Portfolio Creation
- `name`: Required, 3-100 characters
- `description`: Optional, max 500 characters
- `initialNavValue`: Required, positive decimal
- `initialCash`: Required, positive decimal
- `managementFeePercentage`: Required, 0-100
- `entryLoadPercentage`: Required, 0-100
- `exitLoadPercentage`: Required, 0-100
- `brokerageBuyPercentage`: Required, 0-100
- `brokerageSellPercentage`: Required, 0-100

### Holding Creation
- `symbol`: Required, 1-10 characters, uppercase
- `companyName`: Required, 1-100 characters
- `quantity`: Required, positive decimal
- `buyPrice`: Required, positive decimal
- `currentPrice`: Required, positive decimal

This comprehensive structure ensures consistent API behavior and proper error handling across all endpoints.
