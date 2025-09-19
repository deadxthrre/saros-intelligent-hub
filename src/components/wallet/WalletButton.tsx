'use client'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { cn } from '@/lib/utils'

interface WalletButtonProps {
  className?: string
}

export function WalletButton({ className }: WalletButtonProps) {
  return (
    <WalletMultiButton
      className={cn(
        "!bg-blue-600 hover:!bg-blue-700 !border-blue-600 !rounded-lg !font-medium !text-sm !px-4 !py-2 !h-auto",
        className
      )}
    />
  )
}


