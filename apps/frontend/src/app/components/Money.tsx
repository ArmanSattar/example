import React from "react";
import Dollar from "../../../public/icons/dollar.svg";
import { cn } from "../cases/[id]/utils";

interface MoneyProps {
  amount: number;
  className?: string;
  textStyle?: string;
}

export const Money: React.FC<MoneyProps> = ({ amount, className, textStyle = "lg" }) => {
  return (
    <div className={cn(`flex space-x-2 items-center`, className)}>
      <Dollar className="text-yellow-400" />
      <span className={cn(`text-white whitespace-nowrap`, textStyle)}>
        {amount.toLocaleString()}
      </span>
    </div>
  );
};
