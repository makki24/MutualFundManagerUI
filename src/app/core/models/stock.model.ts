export interface Stock {
  id: string;
  companyName: string;
  industry: string;
  sector: string;
  stockType: string;
  bseCode: string;
  nseCode: string;
  bseSymbol: string;
  nseSymbol: string;
  primarySymbol: string;
  displayName: string;
}

export interface StockPrice {
  tickerId: string;
  companyName: string;
  industry: string;
  currentPrice: {
    bsePrice: string;
    nsePrice: string;
  };
  percentChange: number;
  yearHigh: number;
  yearLow: number;
  primaryPrice: number;
}

export interface BuySharesRequest {
  symbol: string;
  companyName: string;
  quantity: number;
  price: number;
  additionalCharges?: number;
  description?: string;
}

export interface BuySharesResponse {
  id: number;
  symbol: string;
  companyName: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  unrealizedGainLoss: number;
  returnPercentage: number;
  lastPriceUpdate: string;
}
