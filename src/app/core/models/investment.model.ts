export interface Investment {
  id: number;
  user: {
    id: number;
    username: string;
  };
  portfolio: {
    id: number;
    name: string;
  };
  unitsHeld: number;
  totalInvested: number;
  averageNav: number;
  currentValue: number;
  totalChargesPaid: number;
  totalReturns: number;
  returnPercentage: number;
  aumPercentage: number;
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

export interface InvestRequest {
  investmentAmount: number;
}

export interface WithdrawRequest {
  unitsToWithdraw: number;
}
