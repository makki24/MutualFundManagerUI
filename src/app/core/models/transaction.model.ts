export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  DIVIDEND = 'DIVIDEND',
  FEE = 'FEE',
  INVESTMENT = 'INVESTMENT',
  WITHDRAWAL = 'WITHDRAWAL'
}

export interface Transaction {
  id: number;
  userId?: number;
  portfolioId: number;
  transactionType: TransactionType;
  symbol?: string;
  quantity?: number;
  pricePerUnit?: number;
  totalAmount: number;
  units?: number;
  navValue?: number;
  description?: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    fullName?: string;
  };
  portfolio?: {
    id: number;
    name: string;
  };
  // Extended optional fields used by UI
  portfolioName?: string;
  netAmount?: number;
  charges?: number;
  referenceId?: string | number | null;
  unitsBefore?: number | null;
  unitsAfter?: number | null;
  navBefore?: number | null;
  navAfter?: number | null;
  remainingCashBefore?: number | null;
  remainingCashAfter?: number | null;
  createdBy?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
}

export interface TransactionFilter {
  userId?: number;
  portfolioId?: number;
  type?: TransactionType;
  symbol?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface PaginationHeaders {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
}

export interface TransactionResponse {
  transactions: Transaction[];
  pagination: PaginationHeaders;
}
