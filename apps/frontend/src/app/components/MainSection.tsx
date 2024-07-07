"use client";

import { Chatbar } from "./chatbar/Chatbar";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { DepositPopUp } from "./navbar/DepositPopUp";
import { toggleDepositClicked, toggleWithdrawClicked } from "../../store/slices/navbarSlice";
import { WithdrawPopUp } from "./navbar/WithdrawPopUp";
import RarityInfoPopup from "../cases/[id]/components/RarityInfoPopup";

export const MainSection = ({ children }: { children: React.ReactNode }) => {
  const [isChatOpen, setChatOpen] = React.useState(true);
  const dispatch = useDispatch();
  const isDepositOpen = useSelector((state: RootState) => state.navbar.isDepositOpen);
  const isWithdrawOpen = useSelector((state: RootState) => state.navbar.isWithdrawOpen);
  const isRarityInfoOpen = useSelector((state: RootState) => state.demo.rarityInfoPopup);

  console.log(isRarityInfoOpen);
  const toggleChatOpen = () => {
    setChatOpen(!isChatOpen);
  };

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
      {isRarityInfoOpen && <RarityInfoPopup />}
      <Chatbar chatOpenCallback={toggleChatOpen} />
      <main className="flex-grow overflow-y-auto relative h-full transition-all duration-500 ease-in-out bg-main_background overflow-x-hidden min-h-full p-4">
        {children}
      </main>
    </div>
  );
};
