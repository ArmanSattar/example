"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useFetchTransactionStats } from "../hooks/useFetchTransactionStats";
import { Spinner } from "../../components/Spinner";
import { User } from "@solspin/user-management-types";
import { Money } from "../../components/Money";
import { toast } from "sonner";

interface UserStatsProps {
  user: User;
}

export const UserStats: React.FC<UserStatsProps> = ({ user }) => {
  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useFetchTransactionStats(user ? user.userId : "");

  useEffect(() => {
    if (isError) {
      toast.error(`${error.message}`);
    }
  }, [isError]);

  return (
    <div className={"w-full flex flex-col justify-between gap-y-2"}>
      <span className={"uppercase text-lg font-bold text-white"}>Stats</span>
      <div
        className={
          "flex flex-col sm:flex-row justify-between items-center gap-y-4 sm:gap-x-4 w-full"
        }
      >
        {isLoading ? (
          <Spinner size={"small"} color={"text-red-500"} />
        ) : stats ? (
          stats.map((stat, index) => (
            <div
              key={index}
              className={
                "relative h-40 rounded-md bg-color_gray_4 flex justify-start items-center p-8 w-full"
              }
            >
              <div className={"flex flex-col justify-between items-start w-full"}>
                <div className="text-white text-lg mt-2 font-semibold">{stat.title}</div>
                <Money
                  amount={Math.round(stat.amount) / 100}
                  textStyle={"text-gray-400 text-lg font-semibold"}
                  className={"mt-1"}
                />
              </div>
              <div
                className={"relative inset-0 w-full h-full m-auto flex justify-center items-center"}
              >
                <Image src={"/coins.png"} alt={stat.title} fill objectFit={"contain"} />
              </div>
            </div>
          ))
        ) : (
          <div className={"text-gray-400"}>No stats available</div>
        )}
      </div>
    </div>
  );
};
