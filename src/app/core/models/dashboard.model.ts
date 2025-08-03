import { Transaction } from './transaction.model';
import { Investment, Holding } from './portfolio.model';

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
  activeInvestments: Investment[];
  topInvestments: Investment[];
  recentTransactionsCount: number;
}

export interface InvestmentSummary {
  userId: number;
  portfolioCount: number;
  totalInvested: number;
  currentValue: number;
  totalCharges: number;
  totalReturns: number;
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
