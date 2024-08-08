import React, { useCallback, useEffect, useRef } from "react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useSolPrice } from "./hooks/useSolPrice";
import { useWalletInfo } from "./hooks/useWalletInfo";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "../../context/AuthContext";
import { fromMinorAmount } from "./utils/money";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "./utils/requests";
import { WithdrawRequest, WithdrawResponse } from "@solspin/types";
import { WALLETS_API_URL } from "../../types";
import Close from "../../../../public/icons/close.svg";
import Wallet from "../../../../public/icons/wallet.svg";
import Dollar from "../../../../public/icons/dollar.svg";

interface WithdrawPopUpProps {
  handleClose: () => void;
}

export const WithdrawPopUp: React.FC<WithdrawPopUpProps> = ({ handleClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [dollarValue, setDollarValue] = React.useState<string>("");
  const [walletAddressValue, setWalletAddressValue] = React.useState<string>("");
  const { data: priceSol, isLoading: isPriceSolLoading, isError: isPriceSolError } = useSolPrice();
  const { user } = useAuth();
  const wallet = useWallet();
  const {
    data: walletInfo,
    isLoading: isWalletInfoLoading,
    isError: isWalletInfoError,
  } = useWalletInfo();
  const queryClient = useQueryClient();

  const { mutateAsync: postDataMutation } = useMutation({
    mutationFn: (data: WithdrawRequest) =>
      postData<WithdrawRequest, WithdrawResponse>(data, `${WALLETS_API_URL}/withdraw`, "POST"),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      console.log(data);
      if (data.txnId) {
        toast.success(`Withdrawal request processed successfully. Txn: ${data.txnId}`);
      } else {
        toast.success("Withdrawal request processed successfully.");
      }
    },
    onError: (error: Error) => {
      toast.error(`Error processing Withdrawal request: ${error.message}`);
    },
    onMutate: () => {
      toast.info("Processing Withdrawal request...");
    },
    retry: 0,
  });

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

  const handleWithdrawClick = async () => {
    try {
      if (!user) {
        toast.error("User is not logged in");
        return;
      }

      if (!walletInfo) {
        toast.error("Failed to fetch wallet info");
        return;
      }

      if (dollarValue === "") {
        toast.error("Please enter a valid amount");
        return;
      } else if (!isValidSolanaAddress(walletAddressValue)) {
        toast.error("Invalid wallet address");
        setWalletAddressValue("");
        return;
      }

      if (!wallet.publicKey) {
        toast.error("Wallet not connected!");
        return;
      }
      const dollarValueFloat = parseFloat(dollarValue);

      if (dollarValueFloat <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      if (fromMinorAmount(walletInfo?.balance) < dollarValueFloat) {
        toast.error("Insufficient balance");
        return;
      }

      if (walletInfo?.wagerRequirement > 0) {
        toast.error("You still have an active wager requirement");
        return;
      }

      await postDataMutation({
        userId: user?.userId,
        walletAddress: wallet.publicKey.toString(),
        amount: dollarValueFloat,
      });

      handleClose();
    } catch (error) {
      toast.error(
        `Error processing Withdrawal request: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  useEffect(() => {
    if (isWalletInfoError) {
      toast.error("Failed to fetch wallet info");
    }
  }, [walletInfo]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleKeyPress, handleClickOutside]);

  if (walletInfo && walletInfo.wagerRequirement > 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <span className="text-2xl text-white font-semibold">
          Active wager requirement of ${fromMinorAmount(walletInfo.wagerRequirement).toFixed(2)}
        </span>
      </div>
    );
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
        <span className="text-white text-2xl font-semibold mb-6">Withdraw</span>
        <fieldset className="relative rounded-sm border-2 border-color_stroke_1 bg-color_gray_3 py-2 p-4 flex space-x-2 h-16 w-2/3 items-center justify-center focus-within:border-color_secondary transition-colors">
          <legend className="text-white text-sm ml-2">Amount</legend>
          <div className={"w-8"}>
            <Dollar className={"ml-1 inset-y-0 my-auto scale-125 text-color_tertiary"} />
          </div>
          <input
            className="w-full placeholder:transition-opacity placeholder:font-light placeholder-gray-400 focus:placeholder:opacity-50 bg-transparent text-white focus:outline-none"
            type="text"
            placeholder={"0"}
            value={dollarValue}
            onChange={handleDollarInputChange}
          />
        </fieldset>
        <fieldset className="relative rounded-sm border-2 border-color_stroke_1 bg-color_gray_3 py-2 p-4 flex space-x-2 h-16 w-2/3 items-center justify-center focus-within:border-color_secondary transition-colors">
          <legend className="text-white text-sm ml-2">Wallet Address</legend>
          <Wallet className={"w-8 h-6 -mt-1 text-color_secondary"} />
          <input
            className="w-full placeholder:transition-opacity placeholder:font-light placeholder-gray-400 focus:placeholder:opacity-50 bg-transparent text-white focus:outline-none text-left"
            type="text"
            placeholder={wallet.publicKey?.toString() ?? undefined}
            value={walletAddressValue}
            onChange={handleWalletAddressInputChange}
          />
        </fieldset>
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
