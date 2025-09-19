import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { connection } from '@/lib/config/solana'
import { DLMMPosition, RebalanceStrategy } from '@/types'
import { dlmmService } from '@/services/dlmm.service'

export class RebalancingService {
  private connection: Connection

  constructor() {
    this.connection = connection
  }

  async analyzeRebalanceOpportunity(position: DLMMPosition, strategy: RebalanceStrategy): Promise<RebalanceOpportunity> {
    try {
      const currentPrice = await dlmmService.getCurrentPrice(position.poolAddress)
      const priceDeviation = this.calculatePriceDeviation(position, currentPrice)
      const shouldRebalance = Math.abs(priceDeviation) > strategy.parameters.priceDeviation
      if (!shouldRebalance) {
        return {
          shouldRebalance: false,
          reason: 'Price deviation within tolerance',
          priceDeviation,
          estimatedGas: 0,
          transactions: []
        }
      }
      const rebalanceTransactions = await this.generateRebalanceTransactions(position, strategy, currentPrice)
      const estimatedGas = await this.estimateGasCost(rebalanceTransactions)
      return {
        shouldRebalance: true,
        reason: `Price deviated by ${priceDeviation.toFixed(2)}%`,
        priceDeviation,
        estimatedGas,
        transactions: rebalanceTransactions,
        newBinDistribution: await this.calculateOptimalBinDistribution(position, currentPrice)
      }
    } catch (error) {
      console.error('Error analyzing rebalance opportunity:', error)
      throw error
    }
  }

  async executeRebalance(
    position: DLMMPosition, 
    strategy: RebalanceStrategy, 
    userPublicKey: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<string> {
    try {
      const opportunity = await this.analyzeRebalanceOpportunity(position, strategy)
      if (!opportunity.shouldRebalance || !opportunity.transactions) {
        throw new Error('No rebalance needed or transactions unavailable')
      }
      if (opportunity.estimatedGas > strategy.parameters.maxGasSpend) {
        throw new Error(`Gas cost ${opportunity.estimatedGas} SOL exceeds maximum ${strategy.parameters.maxGasSpend} SOL`)
      }
      const signatures: string[] = []
      for (const transaction of opportunity.transactions) {
        transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash
        transaction.feePayer = userPublicKey
        const signedTx = await signTransaction(transaction)
        const signature = await this.connection.sendRawTransaction(signedTx.serialize())
        await this.connection.confirmTransaction(signature)
        signatures.push(signature)
      }
      return signatures[signatures.length - 1]
    } catch (error) {
      console.error('Error executing rebalance:', error)
      throw error
    }
  }

  private async getCurrentPrice(poolAddress: string): Promise<number> {
    return dlmmService.getCurrentPrice(poolAddress)
  }

  private calculatePriceDeviation(position: DLMMPosition, currentPrice: number): number {
    const activeBin = position.bins.find(bin => bin.binId === position.activeId)
    if (!activeBin) return 0
    return ((currentPrice - activeBin.price) / activeBin.price) * 100
  }

  private async generateRebalanceTransactions(
    position: DLMMPosition, 
    strategy: RebalanceStrategy, 
    currentPrice: number
  ): Promise<Transaction[]> {
    // mark parameters as used for ESLint until real implementation
    void position; void strategy; void currentPrice
    // STUB: Create placeholder transactions without DLMM SDK
    const tx1 = new Transaction()
    const tx2 = new Transaction()
    return [tx1, tx2]
  }

  private async calculateOptimalBinDistribution(position: DLMMPosition, currentPrice: number): Promise<BinDistributionEntry[]> {
    const totalLiquidity = position.totalXAmount + position.totalYAmount
    const binCount = 10
    const priceRange = 0.1
    const distribution: BinDistributionEntry[] = []
    const priceStep = (priceRange * 2) / binCount
    for (let i = 0; i < binCount; i++) {
      const binPrice = currentPrice * (1 - priceRange + (i * priceStep))
      const weight = this.calculateBinWeight(binPrice, currentPrice)
      distribution.push({
        price: binPrice,
        xAmount: totalLiquidity * weight * 0.5,
        yAmount: totalLiquidity * weight * 0.5
      })
    }
    return distribution
  }

  private calculateBinWeight(binPrice: number, currentPrice: number): number {
    const distance = Math.abs(binPrice - currentPrice) / currentPrice
    return Math.exp(-distance * 10)
  }

  private async estimateGasCost(transactions: Transaction[]): Promise<number> {
    let totalCost = 0
    for (const tx of transactions) {
      const fee = await this.connection.getFeeForMessage(tx.compileMessage())
      totalCost += fee?.value || 5000
    }
    return totalCost / 1e9
  }
}

interface RebalanceOpportunity {
  shouldRebalance: boolean
  reason: string
  priceDeviation: number
  estimatedGas: number
  transactions?: Transaction[]
  newBinDistribution?: BinDistributionEntry[]
}

export const rebalancingService = new RebalancingService()

type BinDistributionEntry = { price: number; xAmount: number; yAmount: number }
