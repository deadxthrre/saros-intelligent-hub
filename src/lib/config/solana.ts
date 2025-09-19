import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;

export const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl(SOLANA_NETWORK);

export const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

// Saros Protocol Constants
export const SAROS_PROGRAM_ID = new PublicKey('SarosTokenProgram11111111111111111111111111');
export const DLMM_PROGRAM_ID = new PublicKey('DLMMTokenProgram1111111111111111111111111111');

// Known token addresses (Devnet)
export const KNOWN_TOKENS = {
  USDC: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
  SOL: new PublicKey('So11111111111111111111111111111111111111112')
  // Add more as needed
};

