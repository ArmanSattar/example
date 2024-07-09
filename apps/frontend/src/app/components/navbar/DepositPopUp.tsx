import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { sendSolTransaction } from "./utils/transactions";
import { useSolPrice } from "./hooks/useSolPrice";
import { useWalletBalance } from "./hooks/useWalletBalance";

interface DepositPopUpProps {
  handleClose: () => void;
}

const HOUSE_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HOUSE_WALLET_PUBLIC_KEY;

if (!HOUSE_WALLET_ADDRESS) {
  throw new Error("House wallet address not provided");
}

export const DepositPopUp: React.FC<DepositPopUpProps> = ({ handleClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [dollarValue, setDollarValue] = useState<string>("");
  const [cryptoValue, setCryptoValue] = useState<string>("");

  const connection = useConnection().connection;
  const wallet = useWallet();
  const { data: priceSol, isLoading: isPriceSolLoading, isError: isPriceSolError } = useSolPrice();
  const balance = useWalletBalance(wallet.publicKey, connection);

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

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleKeyPress, handleClickOutside]);

  const handleDollarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setDollarValue(value);
      setCryptoValue((parseFloat(value || "0") / (priceSol || 1)).toFixed(2));
    }
  };

  const handleCryptoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCryptoValue(value);
      setDollarValue((parseFloat(value || "0") * (priceSol || 1)).toFixed(2));
    }
  };

  const handleMaxClick = useCallback(() => {
    setCryptoValue(balance.toString());
    setDollarValue((balance * (priceSol || 0)).toFixed(2));
  }, [balance, priceSol]);

  /**
   * Validate input and send deposit transaction
   */
  const handleDepositClick = async () => {
    if (!wallet.publicKey) {
      toast.error("Wallet not connected!");
      return;
    }

    const amount = parseFloat(cryptoValue);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid deposit amount");
      return;
    }

    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      console.log(connection, wallet, HOUSE_WALLET_ADDRESS, amount);
      const signature = await sendSolTransaction(connection, wallet, HOUSE_WALLET_ADDRESS, amount);
      toast.success(
        `The transaction is processing. You can follow it here: https://https://solscan.io/tx/${signature}`
      );
      handleClose();
    } catch (error) {
      toast.error(`Error sending transaction. Please try again later. ${error}`);
    }
  };

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
        <span className="text-white text-2xl font-semibold mb-6">Deposit</span>
        <div className="flex flex-col items-start w-full space-y-1">
          <div className="flex justify-between w-full px-2">
            <span className="text-white text-sm">Conversion</span>
            <div className="flex items-center space-x-2 justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-white text-sm">{balance}</span>
                <span className="text-white text-sm">SOL</span>
              </div>
              <span className="text-white text-sm hover:cursor-pointer" onClick={handleMaxClick}>
                Max
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between w-full space-x-2">
            <div className="rounded-sm bg-black py-2 px-4 flex space-x-2 h-12 flex-grow">
              <Image src="/icons/dollar.svg" alt="Coin" width={20} height={20} />
              <input
                className="w-full bg-transparent text-white focus:outline-none"
                type="text"
                placeholder={priceSol ? priceSol.toString() : "Loading..."}
                value={dollarValue}
                onChange={handleDollarInputChange}
              />
            </div>
            <Image src="/icons/arrows-horizontal.svg" alt="Arrows" width={32} height={32} />
            <div className="rounded-sm bg-black py-2 px-4 flex space-x-2 h-12 flex-grow">
              <Image src="/icons/sol-logo.svg" alt="Coin" width={20} height={20} />
              <input
                className="w-full bg-transparent text-white focus:outline-none"
                type="text"
                value={cryptoValue}
                placeholder={"1"}
                onChange={handleCryptoInputChange}
              />
            </div>
          </div>
        </div>
        <p className="text-white text-sm mt-2 text-center">
          {`Current SOL price: ${priceSol ? "$" + priceSol.toFixed(2) : "Loading..."}`}
        </p>
        <button
          className="bg-green-500 text-white py-2 px-5 rounded-md"
          onClick={handleDepositClick}
          disabled={isPriceSolLoading || isPriceSolError}
        >
          Deposit
        </button>
        <p className="text-gray-400 text-sm mt-4 text-center italic">
          Enter the amount you wish to deposit. Please note that the conversion rate shown is an
          estimate. The actual conversion will be based on the current market rate at the time your
          transaction is processed.
        </p>
      </div>
    </div>
  );
};
