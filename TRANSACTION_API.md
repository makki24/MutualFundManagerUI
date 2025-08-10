# Transaction API Documentation

Base URL: `http://your-server:port/api/transactions`

## Authentication
Include JWT token in the `Authorization` header:
```
Authorization: Bearer your.jwt.token
```

## Sorting
All transaction endpoints return results sorted by **creation date in descending order** (newest transactions first).

## Endpoints

### 1. Get Transaction by ID
**GET** `/{id}`

**Example Request:**
```http
GET /api/transactions/123
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 123,
    "portfolioId": 45,
    "transactionType": "BUY",
    "symbol": "RELIANCE",
    "quantity": 10.5,
    "pricePerUnit": 2500.50,
    "totalAmount": 26255.25,
    "createdAt": "2025-08-08T10:30:00"
  }
}
```

### 2. Get User Transactions
**GET** `/user/{userId}`

**Query Params:**
- `page` (optional, default: 0) - Page number (0-based)
- `size` (optional, default: 20) - Number of items per page
- `type` (optional) - Filter by transaction type (e.g., "BUY", "SELL")
- `portfolioId` (optional) - Filter by specific portfolio
- `startDate`, `endDate` (optional) - Filter by date range (ISO format)

**Pagination Response Headers:**
- `X-Total-Count` - Total number of items
- `X-Total-Pages` - Total number of pages
- `X-Current-Page` - Current page number (0-based)
- `X-Page-Size` - Number of items per page
- `X-Has-Next` - Boolean indicating if there are more pages

**Example Request:**
```http
GET /api/transactions/user/5?page=0&size=10&type=BUY
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": 123,
      "portfolioId": 45,
      "transactionType": "BUY",
      "symbol": "RELIANCE",
      "quantity": 10.5,
      "pricePerUnit": 2500.50,
      "totalAmount": 26255.25,
      "createdAt": "2025-08-08T10:30:00"
    },
    // More transactions...
  ]
}
```

### 3. Get Portfolio Transactions
**GET** `/portfolio/{portfolioId}`

**Query Params:**
- `page` (optional, default: 0) - Page number (0-based)
- `size` (optional, default: 20) - Number of items per page
- `type` (optional) - Filter by transaction type (e.g., "BUY", "SELL")
- `symbol` (optional) - Filter by stock symbol
- `startDate`, `endDate` (optional) - Filter by date range (ISO format)

**Pagination Response Headers:**
- `X-Total-Count` - Total number of items
- `X-Total-Pages` - Total number of pages
- `X-Current-Page` - Current page number (0-based)
- `X-Page-Size` - Number of items per page
- `X-Has-Next` - Boolean indicating if there are more pages

**Example Request:**
```http
GET /api/transactions/portfolio/45?page=0&size=10&symbol=RELIANCE
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": 123,
      "userId": 5,
      "transactionType": "BUY",
      "symbol": "RELIANCE",
      "quantity": 10.5,
      "pricePerUnit": 2500.50,
      "totalAmount": 26255.25,
      "createdAt": "2025-08-08T10:30:00"
    },
    // More transactions...
  ]
}
```

### 4. Get Recent Transactions
**GET** `/recent`

**Query Params:**
- `hours` (optional, default: 24) - Number of hours to look back
- `page` (optional, default: 0) - Page number (0-based)
- `size` (optional, default: 20) - Number of items per page

**Pagination Response Headers:**
- `X-Total-Count` - Total number of items
- `X-Total-Pages` - Total number of pages
- `X-Current-Page` - Current page number (0-based)
- `X-Page-Size` - Number of items per page
- `X-Has-Next` - Boolean indicating if there are more pages

**Example Request:**
```http
GET /api/transactions/recent?hours=48&page=0&size=10
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Recent transactions retrieved successfully",
  "data": [
    {
      "id": 123,
      "userId": 5,
      "portfolioId": 45,
      "transactionType": "BUY",
      "symbol": "RELIANCE",
      "quantity": 10.5,
      "pricePerUnit": 2500.50,
      "totalAmount": 26255.25,
      "createdAt": "2025-08-08T10:30:00"
    },
    // More transactions...
  ]
}
```

### 5. Get Transaction Summary
**GET** `/portfolio/{portfolioId}/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 42,
    "totalBuyAmount": 150000.50,
    "totalSellAmount": 75000.25,
    "netInvestment": 75000.25,
    "lastTransactionDate": "2025-08-08T10:30:00"
  }
}
```

### 6. Get All Traded Symbols
**GET** `/symbols`

**Response:**
```json
{
  "success": true,
  "data": ["RELIANCE", "TCS", "HDFCBANK"]
}
```

## Common Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "Transaction not found",
  "error": "Transaction not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error message details"
}
```

## Enums

### TransactionType
- `BUY`
- `SELL`
- `DIVIDEND`
- `FEE`
- `ADJUSTMENT`
