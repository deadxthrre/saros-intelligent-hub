// Note: No direct imports needed here currently

export interface DLMMPosition {
  id: string;
  poolAddress: string;
  userAddress: string;
  tokenX: Token;
  tokenY: Token;
  activeId: number;
  totalXAmount: number;
  totalYAmount: number;
  totalUSDValue: number;
  pnl: number;
  feesEarned: number;
  bins: PositionBin[];
  lastUpdated: Date;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
}

export interface PositionBin {
  binId: number;
  price: number;
  xAmount: number;
  yAmount: number;
  totalSupply: number;
  userShare: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalPnl: number;
  totalFeesEarned: number;
  positionCount: number;
  topPerformer: DLMMPosition | null;
  worstPerformer: DLMMPosition | null;
}

export interface RebalanceStrategy {
  id: string;
  name: string;
  description: string;
  parameters: RebalanceParams;
  isActive: boolean;
  lastExecuted?: Date;
}

export interface RebalanceParams {
  priceDeviation: number; // percentage
  timeInterval: number; // minutes
  slippageTolerance: number; // percentage
  maxGasSpend: number; // SOL
}
