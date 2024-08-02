"use client";

import { Chatbar } from "./chatbar/Chatbar";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { DepositPopUp } from "./navbar/DepositPopUp";
import { toggleDepositClicked, toggleWithdrawClicked } from "../../store/slices/navbarSlice";
import { WithdrawPopUp } from "./navbar/WithdrawPopUp";
import RarityInfoPopup from "../cases/[id]/components/RarityInfoPopup";
import { ExpandButton } from "./chatbar/ExpandButton";
import { toggleChatBarClicked } from "../../store/slices/chatBarSlice";

export const MainSection = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const isChatOpen = useSelector((state: RootState) => state.chatBar.chatBarOpen);
  const isDepositOpen = useSelector((state: RootState) => state.navbar.isDepositOpen);
  const isWithdrawOpen = useSelector((state: RootState) => state.navbar.isWithdrawOpen);
  const isRarityInfoOpen = useSelector((state: RootState) => state.demo.rarityInfoPopup);

  const toggleChatOpen = () => {
    dispatch(toggleChatBarClicked());
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
      <Chatbar />
      <main className="flex-grow overflow-y-auto relative bg-transparent overflow-x-hidden min-h-full p-4">
        {children}
      </main>
      {!isChatOpen && (
        <div
          className={`absolute hidden md:block bottom-12 left-12 transform z-50`}
          style={{ transition: "left 0.3s ease-in-out" }}
        >
          <ExpandButton toggleChatOpen={toggleChatOpen} />
        </div>
      )}
    </div>
  );
};
