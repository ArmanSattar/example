"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";

const mockUserStats = [
  {
    title: "Total Wagered",
    img: "/coins.png",
    value: "0",
  },
  {
    title: "Total Profit",
    img: "/coins.png",
    value: "0",
  },
  {
    title: "Total Deposited",
    img: "/coins.png",
    value: "0",
  },
];

export const UserStats = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className={"w-full flex flex-col justify-between gap-y-2"}>
      <span className={"uppercase text-lg font-bold text-white"}>Stats</span>
      <div
        className={
          "flex flex-col sm:flex-row justify-between items-center gap-y-4 sm:gap-x-4 w-full"
        }
      >
        {mockUserStats.map((stat, index) => (
          <>
            <div
              className={
                "relative h-40 w-full rounded-md bg-color_gray_4 flex justify-start items-center p-8"
              }
            >
              <div className={"flex flex-col justify-between items-start w-full"}>
                <div className="text-white text-lg mt-2 font-semibold">{stat.title}</div>
                <div className="text-gray-400 text-md mt-1">{stat.value}</div>
              </div>
              <div
                className={"relative inset-0 w-full h-full m-auto flex justify-center items-center"}
              >
                <Image src={stat.img} alt={stat.title} fill objectFit={"contain"} />
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};
