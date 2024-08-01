// WalletSignInButton.jsx
import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { CustomWalletModal } from "./WalletModal";

const CustomWalletMultiButton = () => {
  const { select, wallets, connecting, connected, publicKey, disconnect } = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const getButtonText = () => {
    if (isAuthenticating) return "Authenticating...";
    if (connecting) return "Connecting...";
    return "Connect Wallet";
  };

  return (
    <div>
      <button
        onClick={openModal}
        disabled={connecting || isAuthenticating}
        className={`bg-color_primary text-black font-semibold uppercase h-10 md:h-12 px-4 rounded-md border-none cursor-pointer transition-opacity duration-300 ${
          connecting || isAuthenticating ? "cursor-not-allowed opacity-70" : "hover:bg-red-600"
        }`}
      >
        {getButtonText()}
      </button>
      <CustomWalletModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default CustomWalletMultiButton;
