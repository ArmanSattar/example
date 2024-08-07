import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";

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
        setError("Login failed. Please try again.");
      }
    }
  }, [connected, publicKey, login, onClose, shouldAttemptLogin]);

  useEffect(() => {
    if (shouldAttemptLogin) {
      handleConnection();
    }
  }, [shouldAttemptLogin, connected, publicKey]);

  const handleWalletClick = useCallback(
    async (walletName: WalletName<string> | null) => {
      setError(null);
      try {
        console.log(`Selecting wallet: ${walletName}`);
        await select(walletName);

        // Increase the delay and add a check
        await new Promise((resolve) => setTimeout(resolve, 200));

        const selectedWallet = wallets.find((w) => w.adapter.name === walletName);
        if (!selectedWallet) {
          throw new Error("Selected wallet not found");
        }

        console.log(`Wallet selected: ${selectedWallet.adapter.name}`);
        console.log("Attempting to connect...");

        if (selectedWallet.readyState !== WalletReadyState.Installed) {
          setError("Wallet is not detected please install it and try again");
          select(null);
        } else {
          setShouldAttemptLogin(true); // Set the flag to attempt login
        }
      } catch (error) {
        console.error("Wallet connection error:", error);
        if ((error as Error).name === "WalletNotSelectedError") {
          setError("Wallet not selected. Please try again or choose a different wallet.");
        } else {
          setError(`Failed to connect: ${(error as Error).message}`);
        }
      }
    },
    [select, wallets]
  );
  const handleClose = useCallback(
    (event: { preventDefault: () => void }) => {
      event.preventDefault();
      setError(null);
      onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`wallet-adapter-modal ${fadeIn ? "wallet-adapter-modal-fade-in" : ""}`}
      ref={ref}
      role="dialog"
    >
      <div className="wallet-adapter-modal-container">
        <div className="wallet-adapter-modal-wrapper">
          <button onClick={handleClose} className="wallet-adapter-modal-button-close">
            <svg width="14" height="14">
              <path d="M14 12.461L8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
            </svg>
          </button>
          <h1 className="wallet-adapter-modal-title">Connect a wallet on Solana to continue</h1>
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
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
          {connecting && <p style={{ textAlign: "center" }}>Connecting...</p>}
        </div>
      </div>
      <div className="wallet-adapter-modal-overlay" onMouseDown={handleClose} />
    </div>,
    document.body
  );
};
