// WalletSignInButton.jsx
import React, { useCallback, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { CustomWalletModal } from './WalletModal';

const CustomWalletMultiButton = () => {
  const { select, wallets, connecting, connected, publicKey, disconnect } = useWallet();
  const { login } = useAuth(); 
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleClick = useCallback(async () => {
    console.log("Button clicked");
    if (connected && publicKey) {
      // If already connected, attempt to login
      setIsAuthenticating(true);
      try {
        console.log("Attempting login");
        await login();
        console.log("Login successful");
        // Handle successful login (e.g., redirect or update UI)
      } catch (error) {
        console.error("Login failed:", error);
        // Handle login failure (e.g., show error message)
      } finally {
        setIsAuthenticating(false);
      }
    }
  }, [connected, connecting, select, wallets, publicKey, login]);

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
        className={`bg-red-500 text-white h-10 md:h-12 px-4 rounded-md border-none cursor-pointer transition-opacity duration-300 ${
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
