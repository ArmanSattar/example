"use client";

import React, { useState, useEffect } from "react";
import Profile from "./Profile";
import BetHistoryTable from "./BetHistory";
import Navigation from "./Navigation";
import StatCards from "./StatCards";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Bet } from "../../libs/types"

interface UserInfoProps {
  username: string;
}

const UserInfoSection: React.FC<UserInfoProps> = ({ username }) => {
  const [activeTab, setActiveTab] = useState('/profile');
  const [betsData, setBetsData] = useState<Bet[]>([]);  // Properly type the state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth()

  const userId = user?.userId

  useEffect(() => {
    const fetchBets = async () => {
      if (!userId) return;  // Don't fetch if there's no userId

      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BETS_API_URL}/bets/user/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bets');
        }
        const data: Bet[] = await response.json();
        setBetsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBets();
  }, [userId]);

  // TODO - uncomment this for prod
  // if (!user) {
  //   router.replace("/");
  // }

  return (
    <div className="w-full md:w-11/12 lg:w-4/5 mx-auto my-8 p-4 sm:p-6 bg-background rounded-lg relative">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === '/profile' && <Profile />}
      {activeTab === '/bets' && (
        isLoading ? (
          <p>Loading bets...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <BetHistoryTable bets={betsData} />
        )
      )}
      {activeTab === '/stats' && <StatCards />}
    </div>
  );
};

export default UserInfoSection;
