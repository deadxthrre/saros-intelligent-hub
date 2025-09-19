import { Connection, PublicKey } from '@solana/web3.js'
import { LiquidityBookServices, MODE } from '@saros-finance/dlmm-sdk'
import { connection } from '@/lib/config/solana'
import { DLMMPosition, Token, PositionBin } from '@/types'

export class DLMMService {
  private connection: Connection
  private lbs: LiquidityBookServices

  constructor() {
    this.connection = connection
    // Initialize DLMM services in devnet by default; adjust later as needed
    this.lbs = new LiquidityBookServices({ mode: MODE.DEVNET })
  }

  async getUserPositions(userPublicKey: PublicKey): Promise<DLMMPosition[]> {
    try {
      // mark parameter as used for ESLint
      void userPublicKey
      // TODO: integrate actual DLMM user position fetch when SDK method is confirmed
      // Placeholder to keep build green; returns empty until integrated
      return []
    } catch (error) {
      console.error('Error fetching user positions:', error)
      throw error
    }
  }

  async getPositionDetails(positionId: string): Promise<DLMMPosition> {
    try {
      // mark parameter as used for ESLint
      void positionId
      throw new Error('getPositionDetails not implemented yet')
    } catch (error) {
      console.error('Error fetching position details:', error)
      throw error
    }
  }

  private transformPosition(position: {
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
    bins: Array<{
      binId: number;
      price: number;
      xAmount: number;
      yAmount: number;
      totalSupply: number;
      userShare: number;
    }>;
  }): DLMMPosition {
    // Transform SDK position to our interface
    return {
      id: position.id,
      poolAddress: position.poolAddress,
      userAddress: position.userAddress,
      tokenX: this.transformToken(position.tokenX),
      tokenY: this.transformToken(position.tokenY),
      activeId: position.activeId,
      totalXAmount: position.totalXAmount,
      totalYAmount: position.totalYAmount,
      totalUSDValue: position.totalUSDValue,
      pnl: position.pnl,
      feesEarned: position.feesEarned,
      bins: position.bins.map(this.transformBin),
      lastUpdated: new Date()
    }
  }

  private transformToken(token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
    coingeckoId?: string;
  }): Token {
    return {
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logoURI: token.logoURI,
      coingeckoId: token.coingeckoId
    }
  }

  private transformBin(bin: {
    binId: number;
    price: number;
    xAmount: number;
    yAmount: number;
    totalSupply: number;
    userShare: number;
  }): PositionBin {
    return {
      binId: bin.binId,
      price: bin.price,
      xAmount: bin.xAmount,
      yAmount: bin.yAmount,
      totalSupply: bin.totalSupply,
      userShare: bin.userShare
    }
  }
}

export const dlmmService = new DLMMService()


