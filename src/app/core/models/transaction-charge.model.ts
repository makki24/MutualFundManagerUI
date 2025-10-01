export interface Portfolio {
  id: number;
  name: string;
}

export enum ChargeStatus {
  CALCULATED = 'CALCULATED',
  REVIEWED = 'REVIEWED',
  REJECTED = 'REJECTED',
  APPLIED = 'APPLIED'
}

export interface TransactionCharge {
  id: number;
  portfolio: Portfolio;
  calculationDate: string;
  totalTurnover: number;
  buyTurnover: number;
  sellTurnover: number;
  brokerage: number;
  stt: number;
  exchangeCharges: number;
  gst: number;
  sebiCharges: number;
  stampDuty: number;
  dpCharges: number;
  ipftCharges: number;
  totalCharges: number;
  transactionCount: number;
  buyTransactionCount: number;
  sellTransactionCount: number;
  status: ChargeStatus;
  calculationDetails?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  appliedAt?: string;
  createdAt: string;
}

export interface ChargeStatistics {
  totalRecords: number;
  pendingReview: number;
  readyToApply: number;
  applied: number;
  totalChargesAmount: number;
  startDate: string;
  endDate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
