import { Connection, PublicKey } from '@solana/web3.js'
import { DLMM } from '@saros-finance/dlmm-sdk'
import { connection } from '@/lib/config/solana'
import { DLMMPosition, Token, PositionBin } from '@/types'

export class DLMMService {
  private connection: Connection

  constructor() {
    this.connection = connection
  }

  async getUserPositions(userPublicKey: PublicKey): Promise<DLMMPosition[]> {
    try {
      // Initialize DLMM SDK
      const dlmm = new DLMM(this.connection)
      
      // Fetch user positions
      const positions = await dlmm.getUserPositions(userPublicKey)
      
      // Transform to our interface
      return positions.map(this.transformPosition)
    } catch (error) {
      console.error('Error fetching user positions:', error)
      throw error
    }
  }

  async getPositionDetails(positionId: string): Promise<DLMMPosition> {
    try {
      const dlmm = new DLMM(this.connection)
      const position = await dlmm.getPosition(positionId)
      return this.transformPosition(position)
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


