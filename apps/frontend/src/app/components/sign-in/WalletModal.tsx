import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../cases/[id]/utils";
import { toast } from "sonner";

interface CustomWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomWalletModal: React.FC<CustomWalletModalProps> = ({ isOpen, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { wallets, select, connect, connecting, connected, publicKey } = useWallet();
  const [fadeIn, setFadeIn] = useState(false);
  const [shouldAttemptLogin, setShouldAttemptLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { login } = useAuth();
  const installedWallets = useMemo(
    () => wallets.filter((wallet) => wallet.readyState === WalletReadyState.Installed),
    [wallets]
  );
  const otherWallets = useMemo(
    () => wallets.filter((wallet) => wallet.readyState !== WalletReadyState.Installed),
    [wallets]
  );

  useEffect(() => {
    if (isOpen) {
      setFadeIn(true);
      document.body.style.overflow = "hidden";
    } else {
      setFadeIn(false);
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleConnection = useCallback(async () => {
    if (connected && publicKey && shouldAttemptLogin) {
      console.log("Wallet connected successfully");
      console.log("Public key is", publicKey.toBase58());
      try {
        await login();
        onClose();
        setShouldAttemptLogin(false); // Reset the flag
      } catch (error) {
        console.error("Login failed:", error);
        toast.error("Login failed. Please try again.");
        
      }
    }
    setIsConnecting(false)
  }, [connected, publicKey, login, onClose, shouldAttemptLogin]);

  useEffect(() => {
    if (shouldAttemptLogin) {
      handleConnection();
    }
  }, [shouldAttemptLogin, connected, publicKey]);

  const handleWalletClick = useCallback(
    async (walletName: WalletName<string> | null) => {
      setError(null);
      setIsConnecting(true);
      try {
        console.log(`Selecting wallet: ${walletName}`);
        await select(walletName);

        await new Promise((resolve) => setTimeout(resolve, 200));

        const selectedWallet = wallets.find((w) => w.adapter.name === walletName);
        if (!selectedWallet) {
          throw new Error("Selected wallet not found");
        }

        console.log(`Wallet selected: ${selectedWallet.adapter.name}`);
        console.log("Attempting to connect...");

        if (selectedWallet.readyState !== WalletReadyState.Installed) {
          toast.error("Wallet is not detected please install it and try again");
          select(null);
          setIsConnecting(false)
        } else {
          setShouldAttemptLogin(true); // Set the flag to attempt login
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
        if ((error as Error).name === "WalletNotSelectedError") {
          toast.error("Wallet not selected. Please try again or choose a different wallet.");
        } else {
          toast.error(`Failed to connect: ${(error as Error).message}`);
        }
        setIsConnecting(false)
      }
    },
    [select, wallets]
  );

  const handleClose = useCallback(
    (event: { preventDefault: () => void }) => {
      event.preventDefault();
      setError(null);
      onClose();
      setIsConnecting(false)
    },
    [onClose]
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        `wallet-adapter-modal ${fadeIn ? "wallet-adapter-modal-fade-in" : ""}`,
        "bg-black/[0.5]"
      )}
      ref={ref}
      role="dialog"
    >
      <div className="wallet-adapter-modal-container">
        <div className="wallet-adapter-modal-wrapper relative">
          {isConnecting && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
              <div className="w-12 h-12 border-4 border-white-400 border-t-transparent rounded-full animate-spin-slow"></div>
            </div>
          )}
          <button onClick={handleClose} className="wallet-adapter-modal-button-close">
            <svg width="14" height="14">
              <path d="M14 12.461L8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
            </svg>
          </button>
          <h1 className="wallet-adapter-modal-title">Connect a wallet on Solana to continue</h1>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <ul className="wallet-adapter-modal-list">
            {installedWallets.map((wallet) => (
              <li key={wallet.adapter.name} onClick={() => handleWalletClick(wallet.adapter.name)}>
                <button className="wallet-adapter-button" disabled={connecting}>
                  {wallet.adapter.icon && (
                    <img
                      src={wallet.adapter.icon}
                      alt={`${wallet.adapter.name} icon`}
                      style={{ width: "24px", height: "24px", marginRight: "8px" }}
                    />
                  )}
                  {wallet.adapter.name}
                </button>
              </li>
            ))}
            {otherWallets.map((wallet) => (
              <li key={wallet.adapter.name} onClick={() => handleWalletClick(wallet.adapter.name)}>
                <button className="wallet-adapter-button" disabled={connecting}>
                  {wallet.adapter.icon && (
                    <img
                      src={wallet.adapter.icon}
                      alt={`${wallet.adapter.name} icon`}
                      style={{ width: "24px", height: "24px", marginRight: "8px" }}
                    />
                  )}
                  {wallet.adapter.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="wallet-adapter-modal-overlay" onMouseDown={handleClose} />
    </div>,
    document.body
  );
};