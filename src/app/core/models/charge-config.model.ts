export interface ChargeConfig {
  id: number;
  portfolioId: number;
  portfolioName?: string;
  userId: number;
  userName?: string;
  chargeType: ChargeType;
  chargeTypeDisplay?: string;
  calculationMethod: CalculationMethod;
  chargePercentage?: number;
  minChargePerTransaction?: number;
  maxChargePerTransaction?: number;
  fixedChargeAmount?: number;
  appliesToBuy: boolean;
  appliesToSell: boolean;
  isActive: boolean;
  description?: string;
  calculationFormula?: string;
  createdAt?: string;
}

export enum ChargeType {
  MANAGEMENT_FEE = 'MANAGEMENT_FEE',
  ENTRY_LOAD = 'ENTRY_LOAD',
  EXIT_LOAD = 'EXIT_LOAD',
  BROKERAGE = 'BROKERAGE',
  STT = 'STT',
  EXCHANGE_CHARGES = 'EXCHANGE_CHARGES',
  GST = 'GST',
  SEBI_CHARGES = 'SEBI_CHARGES',
  STAMP_DUTY = 'STAMP_DUTY',
  DP_CHARGES = 'DP_CHARGES',
  IPFT_CHARGES = 'IPFT_CHARGES',
  OTHER = 'OTHER'
}

export enum CalculationMethod {
  PERCENTAGE_ONLY = 'PERCENTAGE_ONLY',
  PERCENTAGE_WITH_MIN = 'PERCENTAGE_WITH_MIN',
  PERCENTAGE_WITH_MAX = 'PERCENTAGE_WITH_MAX',
  PERCENTAGE_WITH_MIN_MAX = 'PERCENTAGE_WITH_MIN_MAX',
  FIXED_PER_TRANSACTION = 'FIXED_PER_TRANSACTION',
  FIXED_PER_SCRIP = 'FIXED_PER_SCRIP',
  ZERO_BROKERAGE = 'ZERO_BROKERAGE'
}

export interface CreateChargeConfigRequest {
  chargeType: ChargeType;
  calculationMethod: CalculationMethod;
  chargePercentage?: number;
  minChargePerTransaction?: number;
  maxChargePerTransaction?: number;
  fixedChargeAmount?: number;
  appliesToBuy?: boolean;
  appliesToSell?: boolean;
  description?: string;
}

export interface ChargeTypeOption {
  value: string;
  label: string;
}

export interface CalculationMethodOption {
  value: string;
  label: string;
}
