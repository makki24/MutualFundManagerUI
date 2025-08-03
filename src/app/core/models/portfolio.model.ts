import { User } from './user.model';

export interface Portfolio {
  id: number;
  name: string;
  navValue: number;
  totalAum: number;
  totalUnits: number;
  remainingCash: number;
  totalInvestors: number;
  totalHoldings: number;
  createdBy: {
    id: number;
    username: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioDetails extends Portfolio {
  holdings?: Holding[];
  investors?: Investment[];
}

export interface Holding {
  id: number;
  symbol: string;
  companyName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercentage: number;
}

export interface Investment {
  id: number;
  userId: number;
  portfolioId: number;
  units: number;
  investedNav: number;
  totalInvested: number;
  currentValue: number;
  totalCharges: number;
  totalReturns: number;
  returnPercentage: number;
  user?: User;
}

export interface CreatePortfolioRequest {
  name: string;
  initialInvestors: {
    userId: number;
    amount: number;
  }[];
}

export interface InvestmentRequest {
  amount: number;
}

export interface WithdrawalRequest {
  units: number;
}
