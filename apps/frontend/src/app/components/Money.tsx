import React from "react";
import { cn } from "../cases/[id]/utils";
import Image from "next/image";

interface MoneyProps {
  amount: number;
  className?: string;
  textStyle?: string;
}

export const Money: React.FC<MoneyProps> = ({ amount, className, textStyle = "lg" }) => {
  return (
    <div className={cn(`flex space-x-1 items-center justify-between`, className)}>
      <div className={textStyle === "lg" ? "w-7 h-7 relative" : "w-6 h-6 relative"}>
        <Image
          src={"/icons/gold_coin.png"}
          alt={"Gold coin"}
          width={32}
          height={32}
          objectFit={"contain"}
        />
      </div>
      <span className={cn(`text-white whitespace-nowrap`, textStyle)}>
        {amount.toLocaleString()}
      </span>
    </div>
  );
};
