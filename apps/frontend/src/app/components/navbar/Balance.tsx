"use client";

import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import React, { useEffect } from "react";
import { fromMinorAmount } from "./utils/money";
import { useWalletInfo } from "./hooks/useWalletInfo";
import { setBalance } from "../../../store/slices/userSlice";
import { RootState } from "../../../store";
import Coins from "../../../../public/icons/coins.svg";

export const Balance = () => {
  const dispatch = useDispatch();

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
    <fieldset className="flex rounded-lg items-center justify-center border-2 border-color_tertiary h-12 -mt-2 sm:-mt-1 sm:h-14 bg-color_tertiary_2 ">
      <legend className={"text-xs ml-1"}>BALANCE</legend>
      <div className={`flex space-x-2 items-center justify-between px-4 -mt-1`}>
        <Coins className="text-yellow-400 mt-0.5" />
        <span className={`text-white whitespace-nowrap text-md text-center`}>
          {fromMinorAmount(isLoading ? 0 : balance).toFixed(2)}
        </span>
      </div>
    </fieldset>
  );
};
