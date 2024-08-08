"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";
import { cn } from "../../cases/[id]/utils";

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
      <div className={"flex justify-between items-center bg-color_gray_4 rounded-md p-4 shadow-lg"}>
        {mockUserStats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              `relative h-40 w-max flex-1 flex-grow pl-2`,
              index !== mockUserStats.length - 1 ? "border-r-2 border-r-color_gray_3" : ""
            )}
          >
            <div className={"flex justify-between items-center bg-transparent h-full p-4 gap-x-4"}>
              <div className={"relative w-1/3 h-full flex justify-center items-center"}>
                <Image src={stat.img} alt={stat.title} fill objectFit={"contain"} />
              </div>
              <div className={"flex flex-col justify-between items-start w-full"}>
                <div className="text-white text-lg mt-2 font-semibold">{stat.title}</div>
                <div className="text-gray-400 text-md mt-1">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
