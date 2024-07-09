"use client";

import { useDispatch } from "react-redux";
import { toggleDepositClicked } from "../../../store/slices/navbarSlice";
import { Money } from "../Money";
import { toast } from "sonner";
import { useEffect } from "react";
import { fromMinorAmount } from "./utils/money";
import { useWalletInfo } from "./hooks/useWalletInfo";

export const Balance = () => {
  const dispatch = useDispatch();

  const handleDepositClick = () => {
    dispatch(toggleDepositClicked());
  };
  const { data: wallet, isLoading, isError } = useWalletInfo();

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch balance");
    }
  }, [isError]);

  return (
    <div className="rounded-lg bg-gray-700 flex items-center justify-between">
      {isLoading ? (
        <div className="px-4">Loading...</div>
      ) : (
        <Money amount={fromMinorAmount(wallet?.balance) ?? 0} className="px-4" />
      )}
      <button
        className="rounded-lg bg-green-500 p-2 w-12 h-12 hover:bg-green-400 hover:scale-105 duration-100"
        onClick={handleDepositClick}
      >
        <span className="text-white text-2xl font-bold">+</span>
      </button>
    </div>
  );
};
