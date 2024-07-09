import React from "react";
import Dollar from "../../../public/icons/dollar.svg";

interface MoneyProps {
  amount: number;
  className?: string;
  textSize?: string;
}

export const Money: React.FC<MoneyProps> = ({ amount, className, textSize }) => {
  return (
    <div className={`flex space-x-2 items-center ${className}`}>
      <Dollar className="text-yellow-400" />
      <span className={`text-lg text-white text-${textSize}`}>{amount.toFixed(2)}</span>
    </div>
  );
};
