"use client";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, UnsafeBurnerWalletAdapter, CoinbaseWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Commitment } from "@solana/web3.js";

import React, { ReactNode, useMemo } from "react";

require("@solana/wallet-adapter-react-ui/styles.css");

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new UnsafeBurnerWalletAdapter(), new CoinbaseWalletAdapter(), new SolflareWalletAdapter()],
    [network]
  );
  const connectionConfig = useMemo(
    () => ({
      commitment: "finalized" as Commitment,
    }),
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
