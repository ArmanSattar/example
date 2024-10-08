"use client";

import { Chatbar } from "./chatbar/Chatbar";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { DepositPopUp } from "./navbar/DepositPopUp";
import { toggleDepositClicked, toggleWithdrawClicked } from "../../store/slices/navbarSlice";
import { WithdrawPopUp } from "./navbar/WithdrawPopUp";

export const MainSection = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const isDepositOpen = useSelector((state: RootState) => state.navbar.isDepositOpen);
  const isWithdrawOpen = useSelector((state: RootState) => state.navbar.isWithdrawOpen);

  const toggleDepositOpen = () => {
    dispatch(toggleDepositClicked());
  };

  const toggleWithdrawOpen = () => {
    dispatch(toggleWithdrawClicked());
  };

  return (
    <div className="flex flex-1 overflow-hidden relative w-full max-w-full">
      {isDepositOpen && <DepositPopUp handleClose={toggleDepositOpen} />}
      {isWithdrawOpen && <WithdrawPopUp handleClose={toggleWithdrawOpen} />}
      <Chatbar />
      <main className="flex-grow overflow-y-auto relative bg-transparent overflow-x-hidden min-h-full p-4">
        {children}
      </main>
    </div>
  );
};
