"use client";

import { useDispatch, useSelector } from "react-redux";
import { toggleDepositClicked } from "../../../store/slices/navbarSlice";
import { Money } from "../Money";
import { toast } from "sonner";
import { useEffect } from "react";
import { fromMinorAmount } from "./utils/money";
import { useWalletInfo } from "./hooks/useWalletInfo";
import { setBalance } from "../../../store/slices/userSlice";
import { RootState } from "../../../store";
import { Spinner } from "../Spinner";

export const Balance = () => {
  const dispatch = useDispatch();

  const handleDepositClick = () => {
    dispatch(toggleDepositClicked());
  };
  const { data: wallet, isLoading, isError } = useWalletInfo();
  const balance = useSelector((state: RootState) => state.user.balance);

  useEffect(() => {
    if (wallet?.balance) {
      dispatch(setBalance(wallet.balance));
    }
  }, [wallet?.balance]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch balance");
    }
  }, [isError]);

  return (
    <div className="flex rounded-lg bg-gray-700 items-center justify-between">
      {isLoading ? (
        <Spinner size={"small"} color={"text-white"} />
      ) : (
        <Money amount={fromMinorAmount(balance)} className="px-4" />
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
