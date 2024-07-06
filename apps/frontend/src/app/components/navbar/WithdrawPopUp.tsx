import React, { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useSolPrice } from "./hooks/useSolPrice";

interface WithdrawPopUpProps {
  handleClose: () => void;
}

export const WithdrawPopUp: React.FC<WithdrawPopUpProps> = ({ handleClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [dollarValue, setDollarValue] = React.useState<string>("");
  const [walletAddressValue, setWalletAddressValue] = React.useState<string>("");
  const { data: priceSol, isLoading: isPriceSolLoading, isError: isPriceSolError } = useSolPrice();

  function isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  const handleDollarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setDollarValue(value);
    }
  };

  const handleWalletAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWalletAddressValue(value);
  };

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        // Check if the click is on a toast or within a toast
        const isToastClick = (event.target as Element).closest("[data-sonner-toast]") !== null;

        if (!isToastClick) {
          handleClose();
        }
      }
    },
    [handleClose]
  );

  const handleWithdrawClick = () => {
    if (dollarValue === "") {
      toast.error("Please enter a valid amount");
    } else if (!isValidSolanaAddress(walletAddressValue)) {
      toast.error("Invalid wallet address");
      setWalletAddressValue("");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleKeyPress, handleClickOutside]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-background p-8 rounded-lg shadow-lg w-11/12 md:w-1/3 h-auto md:h-1/2 max-w-4xl transform translate-y-0 flex flex-col items-center justify-between relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-6 right-10 text-white hover:text-gray-300"
        >
          X
        </button>
        <span className="text-white text-2xl font-semibold mb-6">Withdraw</span>
        <div className="flex flex-col items-start justify-start w-2/3">
          <span className="text-white text-sm mb-1 ml-2">Amount</span>
          <div className="flex items-center justify-center w-full space-x-2">
            <div className="rounded-sm bg-black py-2 px-4 flex space-x-2 h-12 w-full">
              <Image src="/icons/dollar.svg" alt="Coin" width={20} height={20} />
              <input
                className="w-full bg-transparent text-white focus:outline-none"
                type="text"
                placeholder={"0"}
                value={dollarValue}
                onChange={handleDollarInputChange}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start justify-start w-2/3">
          <span className="text-white text-sm mb-1 ml-2">Wallet Address</span>
          <div className="flex items-center justify-center w-full space-x-2">
            <div className="rounded-sm bg-black py-2 px-4 flex space-x-2 h-12 w-full">
              <Image src="/icons/wallet.svg" alt="Coin" width={20} height={20} />
              <input
                className="w-full bg-transparent text-white focus:outline-none"
                type="text"
                value={walletAddressValue}
                onChange={handleWalletAddressInputChange}
              />
            </div>
          </div>
        </div>
        <p className="text-white text-sm mt-2 text-center">
          {`Current SOL price: ${priceSol ? "$" + priceSol.toFixed(2) : "Loading..."}`}
        </p>
        <button
          className="bg-green-500 text-white py-2 px-5 rounded-md"
          onClick={handleWithdrawClick}
        >
          Withdraw
        </button>
        <p className="text-gray-400 text-sm mt-4 text-center italic">
          Enter the amount you wish to withdraw. Please note that the conversion rate shown is an
          estimate. The actual conversion will be based on the current market rate at the time your
          transaction is processed.
        </p>
      </div>
    </div>
  );
};
