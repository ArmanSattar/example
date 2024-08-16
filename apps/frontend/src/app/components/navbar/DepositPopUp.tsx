import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { createAndSignTransaction } from "./utils/transactions";
import { useAuth } from "../../context/AuthContext";
import { useSolPrice } from "./hooks/useSolPrice";
import { useWalletBalance } from "./hooks/useWalletBalance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ArrowHorizontal from "../../../../public/icons/arrows-horizontal.svg";
import { postData } from "./utils/requests";
import { DepositResponse } from "@solspin/types";
import { HOUSE_WALLET_ADDRESS, WALLETS_API_URL } from "../../types";
import Close from "../../../../public/icons/close.svg";
import { v4 as uuid } from "uuid";

interface DepositPopUpProps {
  handleClose: () => void;
}

type DepositData = {
  requestId: string;
  walletAddress: string;
  txnSignature: string;
  userId: string;
};

export const DepositPopUp: React.FC<DepositPopUpProps> = ({ handleClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [dollarValue, setDollarValue] = useState<string>("");
  const [cryptoValue, setCryptoValue] = useState<string>("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const connection = useConnection().connection;
  const wallet = useWallet();
  const { data: priceSol, isLoading: isPriceSolLoading, isError: isPriceSolError } = useSolPrice();
  const balance = useWalletBalance(wallet.publicKey, connection);

  const { mutateAsync: postDataMutation } = useMutation({
    mutationFn: (data: DepositData) =>
      postData<DepositData, DepositResponse>(data, `${WALLETS_API_URL}/deposit`, "POST"),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] }).then(() => {
        if (data.txnId) {
          toast.success("Deposit request processed successfully", {
            action: {
              label: "View transaction",
              onClick: () => window.open(`https://explorer.solana.com/tx/${data.txnId}`, "_blank"),
            },
          });
        } else {
          toast.success("Deposit request processed successfully.");
        }
      });
    },
    onMutate: () => {
      toast.info("Processing deposit request...");
    },
    retry: 0,
  });

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

  const handleDollarInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*\.?\d{0,2}$/.test(value)) {
        setDollarValue(value);
        setCryptoValue((parseFloat(value || "0") / (priceSol || 1)).toFixed(2));
      }
    },
    [priceSol]
  );

  const handleCryptoInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*\.?\d*$/.test(value)) {
        setCryptoValue(value);
        setDollarValue((parseFloat(value || "0") * (priceSol || 1)).toFixed(2));
      }
    },
    [priceSol]
  );

  const handleMaxClick = useCallback(() => {
    setCryptoValue(balance.toString());
    setDollarValue((balance * (priceSol || 0)).toFixed(2));
  }, [balance, priceSol]);

  /**
   * Validate input and send deposit transaction
   */
  const handleDepositClick = useCallback(async () => {
    if (!user) {
      return;
    }

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
      const signature = await createAndSignTransaction(
        connection,
        wallet,
        HOUSE_WALLET_ADDRESS,
        amount
      );

      await postDataMutation({
        requestId: uuid(),
        walletAddress: wallet.publicKey.toString(),
        txnSignature: signature,
        userId: user?.userId,
      });
      handleClose();
    } catch (error) {
      toast.error(`Error sending transaction. Please try again later. ${error}`);
    }
  }, [cryptoValue, balance, user, wallet, connection, postDataMutation, handleClose]);

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-color_gray_4 py-6 px-8 rounded-lg border-4 border-color_stroke_1 shadow-lg w-11/12 md:w-1/2 xl:w-1/3 h-auto max-w-4xl transform translate-y-0 flex flex-col items-center justify-between relative gap-y-[2vh]"
      >
        <Close
          onClick={handleClose}
          className="absolute top-7 right-7 text-white cursor-pointer hover:opacity-90 w-6 h-6"
        />
        <span className="text-white text-2xl font-semibold mb-6">Deposit</span>
        <div className="flex flex-col items-start w-full">
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
            <div className="rounded-sm border-2 border-color_stroke_1 bg-color_gray_3 py-2 p-4 flex space-x-2 h-12 w-full items-center justify-center focus-within:border-color_secondary transition-colors">
              <div className={"relative w-8 h-8 flex justify-center items-center"}>
                <Image src={"/icons/gold_coin.png"} alt={"Gold coin"} width={32} height={32} />
              </div>
              <input
                className="w-full placeholder:transition-opacity placeholder:font-light placeholder-gray-300 focus:placeholder:opacity-50 bg-transparent text-white focus:outline-none"
                type="text"
                placeholder={priceSol ? priceSol.toString() : "Loading..."}
                value={dollarValue}
                onChange={handleDollarInputChange}
              />
            </div>
            <ArrowHorizontal className={"text-gray-300 w-10 h-10 scale-105"} />
            <div className="rounded-sm border-2 border-color_stroke_1 bg-color_gray_3 py-2 p-4 flex space-x-2 h-12 w-full items-center justify-center focus-within:border-color_secondary transition-colors">
              <Image src="/icons/sol-logo.svg" alt="Coin" width={20} height={20} />
              <input
                className="w-full placeholder:transition-opacity placeholder:font-light placeholder-gray-300 focus:placeholder:opacity-50 bg-transparent text-white focus:outline-none"
                type="text"
                value={cryptoValue}
                placeholder={"1"}
                onChange={handleCryptoInputChange}
              />
            </div>
          </div>
        </div>
        <p className="text-white text-sm mt-2 text-center italic">
          {`Current SOL price: ${
            isPriceSolLoading
              ? "Loading..."
              : isPriceSolError
              ? "Error"
              : priceSol
              ? "$" + priceSol.toFixed(2)
              : "Loading..."
          }`}
        </p>
        <button
          className="action-btn-green bg-color_secondary text-white py-2 px-5 rounded-md"
          onClick={handleDepositClick}
          disabled={isPriceSolLoading || isPriceSolError}
        >
          Deposit
        </button>
        <p className="text-gray-400 text-sm text-center italic">
          Enter the amount you wish to deposit. Please note that the conversion rate shown is an
          estimate. The actual conversion will be based on the current market rate at the time your
          transaction is processed.
        </p>
      </div>
    </div>
  );
};
