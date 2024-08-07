"use client";

import React, { useState } from "react";
import Profile from "./Profile";
import BetHistoryTable from "./BetHistory";
import Navigation from "./Navigation";
import StatCards from "./StatCards";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

interface UserInfoProps {
  username: string;
}

const UserInfoSection: React.FC<UserInfoProps> = ({ username }) => {
  const [activeTab, setActiveTab] = useState("/profile");
  const { user } = useAuth();
  const router = useRouter();

  const betsData = [
    {
      id: "6676fba1548cd425eb1305c7",
      amount: 0.45,
      gameType: "Case prize",
      outcome: "$0.45 Voucher",
      time: "JUN 22, 2024, 17:28:17",
    },
    {
      id: "6676fba1548cd425eb1305c0",
      amount: -0.15,
      gameType: "Case spin",
      outcome: "$1 Voucher",
      time: "JUN 22, 2024, 17:28:17",
    },
    {
      id: "6676fba1548cd425eb1305c9",
      amount: 15,
      gameType: "Case spin",
      outcome: "$5 Voucher",
      time: "JUN 22, 2024, 17:29:17",
    },
    {
      id: "6676fba1548cd425eb1305ca",
      amount: 1.0,
      gameType: "Bonus",
      outcome: "LOW RISK",
      time: "JUN 22, 2024, 17:30:17",
    },
    {
      id: "6676fba1548cd425eb1305cb",
      amount: -0.5,
      gameType: "Bet lost",
      outcome: "HIGH RISK",
      time: "JUN 22, 2024, 17:31:17",
    },
    {
      id: "6676fba1548cd425eb1305cc",
      amount: 2.75,
      gameType: "Case prize",
      outcome: "$2.75 Voucher",
      time: "JUN 22, 2024, 17:32:17",
    },
    {
      id: "6676fba1548cd425eb1305cd",
      amount: -1.25,
      gameType: "Bet lost",
      outcome: "HIGH RISK",
      time: "JUN 22, 2024, 17:33:17",
    },
    {
      id: "6676fba1548cd425eb1305ce",
      amount: 0.85,
      gameType: "Case prize",
      outcome: "$0.85 Voucher",
      time: "JUN 22, 2024, 17:34:17",
    },
    {
      id: "6676fba1548cd425eb1305cf",
      amount: 5.0,
      gameType: "Bonus",
      outcome: "LOW RISK",
      time: "JUN 22, 2024, 17:35:17",
    },
    {
      id: "6676fba1548cd425eb1305d0",
      amount: -0.75,
      gameType: "Bet lost",
      outcome: "HIGH RISK",
      time: "JUN 22, 2024, 17:36:17",
    },
    {
      id: "6676fba1548cd425eb1305d1",
      amount: 3.25,
      gameType: "Case prize",
      outcome: "$3.25 Voucher",
      time: "JUN 22, 2024, 17:37:17",
    },
    {
      id: "6676fba1548cd425eb1305d2",
      amount: -2.0,
      gameType: "Bet lost",
      outcome: "HIGH RISK",
      time: "JUN 22, 2024, 17:38:17",
    },
    {
      id: "6676fba1548cd425eb1305d3",
      amount: 1.5,
      gameType: "Case prize",
      outcome: "$1.50 Voucher",
      time: "JUN 22, 2024, 17:39:17",
    },
    {
      id: "6676fba1548cd425eb1305d4",
      amount: 4.0,
      gameType: "Bonus",
      outcome: "LOW RISK",
      time: "JUN 22, 2024, 17:40:17",
    },
    {
      id: "6676fba1548cd425eb1305d5",
      amount: -0.25,
      gameType: "Bet lost",
      outcome: "HIGH RISK",
      time: "JUN 22, 2024, 17:41:17",
    },
    {
      id: "6676fba1548cd425eb1305d6",
      amount: 2.0,
      gameType: "Case prize",
      outcome: "$2.00 Voucher",
      time: "JUN 22, 2024, 17:42:17",
    },
    {
      id: "6676fba1548cd425eb1305d7",
      amount: -1.5,
      gameType: "Bet lost",
      outcome: "HIGH RISK",
      time: "JUN 22, 2024, 17:43:17",
    },
    {
      id: "6676fba1548cd425eb1305d8",
      amount: 0.65,
      gameType: "Case prize",
      outcome: "$0.65 Voucher",
      time: "JUN 22, 2024, 17:44:17",
    },
    {
      id: "6676fba1548cd425eb1305d8",
      amount: 0.65,
      gameType: "Case prize",
      outcome: "$0.65 Voucher",
      time: "JUN 22, 2024, 17:44:17",
    },
    {
      id: "6676fba1548cd425eb1305d8",
      amount: 0.65,
      gameType: "Case prize",
      outcome: "$0.65 Voucher",
      time: "JUN 22, 2024, 17:44:17",
    },
    {
      id: "6676fba1548cd425eb1305d8",
      amount: 0.65,
      gameType: "Case prize",
      outcome: "$0.65 Voucher",
      time: "JUN 22, 2024, 17:44:17",
    },
    {
      id: "6676fba1548cd425eb1305d8",
      amount: 0.65,
      gameType: "Case prize",
      outcome: "$0.65 Voucher",
      time: "JUN 22, 2024, 17:44:17",
    },
    {
      id: "6676fba1548cd425eb1305d8",
      amount: 0.65,
      gameType: "Case prize",
      outcome: "$0.65 Voucher",
      time: "JUN 22, 2024, 17:44:17",
    },
    {
      id: "6676fba1548cd425eb1305d8",
      amount: 0.65,
      gameType: "Case prize",
      outcome: "$0.65 Voucher",
      time: "JUN 22, 2024, 17:44:17",
    },
    {
      id: "6676fba1548cd425eb1305d8",
      amount: 0.65,
      gameType: "Case prize",
      outcome: "$0.65 Voucher",
      time: "JUN 22, 2024, 17:44:17",
    },
    {
      id: "6676fba1548cd425eb1305d8",
      amount: 0.65,
      gameType: "Case prize",
      outcome: "$0.65 Voucher",
      time: "JUN 22, 2024, 17:44:17",
    },
    {
      id: "6676fba1548cd425eb1305d8",
      amount: 0.65,
      gameType: "Case prize",
      outcome: "$0.65 Voucher",
      time: "JUN 22, 2024, 17:44:17",
    },
  ];

  // TODO - uncomment this for prod
  // if (!user) {
  //   router.replace("/");
  // }

  return (
    <div className="w-full md:w-11/12 lg:w-4/5 mx-auto my-8 p-4 sm:p-6 bg-background rounded-lg relative">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "/profile" && <Profile username={username} />}
      {activeTab === "/bets" && <BetHistoryTable bets={betsData} />}
      {activeTab === "/stats" && <StatCards />}
    </div>
  );
};

export default UserInfoSection;
