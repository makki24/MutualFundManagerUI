import { User } from './user.model';

export interface Portfolio {
  id: number;
  name: string;
  description?: string;
  navValue: number;
  totalAum: number;
  totalUnits: number;
  remainingCash: number;
  managementFeePercentage?: number;
  entryLoadPercentage?: number;
  exitLoadPercentage?: number;
  brokerageBuyPercentage?: number;
  brokerageSellPercentage?: number;
  isActive?: boolean;
  totalInvestors: number;
  totalHoldings: number;
  totalHoldingsValue?: number;
  totalPortfolioValue?: number;
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
  description: string;
  initialNavValue: number;
  initialCash: number;
  managementFeePercentage: number;
  entryLoadPercentage: number;
  exitLoadPercentage: number;
  brokerageBuyPercentage: number;
  brokerageSellPercentage: number;
  initialInvestors: {
    userId: number;
    investmentAmount: number;
  }[];
}

export interface UpdatePortfolioRequest {
  name?: string;
  description?: string;
  managementFeePercentage?: number;
  entryLoadPercentage?: number;
  exitLoadPercentage?: number;
  brokerageBuyPercentage?: number;
  brokerageSellPercentage?: number;
}

export interface InvestmentRequest {
  investmentAmount: number;
}

export interface WithdrawalRequest {
  unitsToWithdraw: number;
}

export interface AddCashRequest {
  amount: number;
}

export interface UpdateNavRequest {
  newNavValue: number;
}
