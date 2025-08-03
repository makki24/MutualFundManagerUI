export interface Holding {
  id: number;
  portfolioId: number;
  portfolioName: string;
  symbol: string;
  companyName: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  lastPriceUpdate: string;
  totalInvested: number;
  currentValue: number;
  unrealizedGainLoss: number;
  returnPercentage: number;
}

export interface CreateHoldingRequest {
  symbol: string;
  companyName: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

export interface BuySharesRequest {
  quantity: number;
  buyPrice: number;
}

export interface SellSharesRequest {
  quantity: number;
  sellPrice: number;
}

export interface PriceUpdateRequest {
  priceUpdates: {
    symbol: string;
    currentPrice: number;
  }[];
}

export interface PriceUpdateResponse {
  updatedCount: number;
  failedUpdates: string[];
}
