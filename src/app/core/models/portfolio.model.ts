import { User } from './user.model';

export interface Portfolio {
  id: number;
  name: string;
  description?: string;
  navValue: number;
  totalAum: number;
  totalUnits: number;
  remainingCash: number;
  isActive?: boolean;
  totalInvestors: number;
  totalHoldings: number;
  totalHoldingsValue?: number;
  totalPortfolioValue?: number;
  // New fee system fields
  currentFeeAmount?: number | null;
  remainingFeeAmount?: number | null;
  feeFromDate?: string | null;
  feeToDate?: string | null;
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
  buyPrice: number;
  currentPrice: number;
  totalValue: number;
  totalInvested: number;
  unrealizedGainLoss: number;
  returnPercentage: number;
  needsManualUpdate?: boolean;
}

export interface Investment {
  id: number;
  userId: number;
  portfolioId: number;
  units: number;
  investedNav: number;
  totalInvested: number;
  currentValue: number;
  totalCharges: number; // Deprecated - use totalFeesPaid
  totalFeesPaid: number; // New field name
  totalReturns: number;
  returnPercentage: number;
  investmentDate?: string;
  feeAllocations?: UserFeeAllocation[];
  user?: User;
}

export interface CreatePortfolioRequest {
  name: string;
  description: string;
  initialNavValue: number;
  initialInvestors: {
    userId: number;
    investmentAmount: number;
  }[];
}

export interface UpdatePortfolioRequest {
  name?: string;
  description?: string;
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

// New Fee System Interfaces
export interface PortfolioFee {
  id: number;
  portfolioId: number;
  portfolioName?: string;
  totalFeeAmount: number;
  remainingFeeAmount: number;
  fromDate: string;
  toDate: string;
  isActive: boolean;
  description?: string;
  createdByUserId?: number;
  createdByUserName?: string;
  createdAt?: string;
  totalDays: number;
  remainingDays: number;
  dailyFeeAmount: number;
  allocatedFeeAmount: number;
}

export interface CreatePortfolioFeeRequest {
  totalFeeAmount: number;
  fromDate: string;
  toDate: string;
  description?: string;
}

export interface UserFeeAllocation {
  id: number;
  portfolioFeeId: number;
  userId: number;
  userName?: string;
  allocatedAmount: number;
  unitsDeducted: number;
  allocationDate: string;
  remainingDaysAtAllocation: number;
  totalUsersAtAllocation: number;
  description: string;
  feeType?: string;
  portfolioName?: string;
  type?: 'DEDUCTION' | 'CREDIT';
}
