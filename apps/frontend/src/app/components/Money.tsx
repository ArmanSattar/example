import React from "react";
import Dollar from "../../../public/icons/dollar.svg";
import { cn } from "../cases/[id]/utils";

interface MoneyProps {
  amount: number;
  className?: string;
  textSize?: string;
}

export const Money: React.FC<MoneyProps> = ({ amount, className, textSize = "lg" }) => {
  return (
    <div className={cn(`flex space-x-2 items-center`, className)}>
      <Dollar className="text-yellow-400" />
      <span className={cn(`text-white whitespace-nowrap`, `text-${textSize}`)}>
        {amount.toFixed(2)}
      </span>
    </div>
  );
};
