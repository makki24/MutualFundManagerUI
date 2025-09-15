import { Transaction } from './transaction.model';
import {Investment, Holding, Portfolio} from './portfolio.model';

export interface AdminDashboard {
  totalPortfolios: number;
  totalUsers: number;
  totalAum: number;
  totalTransactions: number;
  recentTransactions: Transaction[];
  portfolioPerformance: PortfolioPerformance[];
  userGrowth: UserGrowth[];
}

export interface UserDashboard {
  investmentSummary: InvestmentSummary;
  activeInvestments: ActiveInvestment[];
  topInvestments: TopInvestment[];
  recentTransactionsCount: number;
}

export interface InvestmentSummary {
  portfolioCount: number;
  totalInvested: number;
  currentValue: number;
  totalCharges: number;
  totalReturns: number;
  returnPercentage: number;
}

export interface ActiveInvestment {
  portfolioName: string;
  unitsHeld: number;
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  returnPercentage: number;
  updatedAt: string;
  portfolio: Portfolio;
}

export interface TopInvestment {
  portfolioId: number;
  portfolioName: string;
  returnPercentage: number;
}

export interface PortfolioPerformance {
  portfolioId: number;
  portfolioName: string;
  navValue: number;
  totalAum: number;
  returnPercentage: number;
}

export interface UserGrowth {
  month: string;
  userCount: number;
}

export interface MarketOverview {
  totalMarketValue: number;
  topPerformers: Holding[];
  marketTrends: MarketTrend[];
}

export interface MarketTrend {
  date: string;
  value: number;
}

export interface NavHistoryItem {
  timestamp: string;
  navValue: number;
  transactionType: string;
  description: string;
  changeAmount: number;
  changePercentage: number;
}

export interface NavHistoryResponse {
  success: boolean;
  message: string;
  data: NavHistoryItem[];
}
