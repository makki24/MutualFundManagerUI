export interface Transaction {
  id: number;
  userId: number;
  portfolioId: number;
  type: 'INVESTMENT' | 'WITHDRAWAL' | 'FEE' | 'BUY' | 'SELL';
  amount: number;
  units?: number;
  navValue?: number;
  description: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  portfolio?: {
    id: number;
    name: string;
  };
}

export interface TransactionFilter {
  userId?: number;
  portfolioId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
