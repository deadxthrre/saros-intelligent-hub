import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { dlmmService } from '@/services/dlmm.service'
import { DLMMPosition } from '@/types'

export function useDLMMPositions() {
  const { publicKey } = useWallet()

  return useQuery<DLMMPosition[]>({
    queryKey: ['dlmm-positions', publicKey?.toString()],
    queryFn: () => {
      if (!publicKey) throw new Error('Wallet not connected')
      return dlmmService.getUserPositions(publicKey)
    },
    enabled: !!publicKey,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  })
}
