// WalletSignInButton.jsx
import React, { useCallback, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";

const CustomWalletMultiButton = () => {
  const { select, wallets, connecting, connected, publicKey, disconnect } = useWallet();
  const { login } = useAuth(); // Your custom auth hook
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
    } else if (!connecting) {
      // If not connected and not in the process of connecting, initiate wallet connection
      try {
        if (wallets.length === 1) {
          console.log("Selecting single wallet:", wallets[0].adapter.name);
          await select(wallets[0].adapter.name);
        } else {
          console.log("Opening wallet selection modal");
          await select(wallets[0].adapter.name);
        }
      } catch (error) {
        console.error("Wallet connection failed:", error);
        // Handle connection failure (e.g., show error message)
      }
    }
  }, [connected, connecting, select, wallets, publicKey, login]);

  const getButtonText = () => {
    if (isAuthenticating) return "Authenticating...";
    if (connecting) return "Connecting...";
    return "Connect Wallet";
  };

  return (
    <button
      onClick={handleClick}
      disabled={connecting || isAuthenticating}
      className={`bg-red-500 text-white h-10 md:h-12 px-4 rounded-md border-none cursor-pointer transition-opacity duration-300 ${
        connecting || isAuthenticating ? "cursor-not-allowed opacity-70" : "hover:bg-red-600"
      }`}
    >
      {getButtonText()}
    </button>
  );
};

export default CustomWalletMultiButton;
