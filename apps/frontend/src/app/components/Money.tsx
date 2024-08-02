import React from "react";
import Dollar from "../../../public/icons/dollar.svg";

interface MoneyProps {
  amount: number;
  className?: string;
  textSize?: string;
  space?: string;
  imagePath?: string;
}

export const Money: React.FC<MoneyProps> = ({
  amount,
  className,
  textSize = "lg",
  space = "8px",
}) => {
  return (
    <div className={`flex ${className} space-x-[${space}] items-center`}>
      <Dollar className="text-yellow-400" />
      <span className={`text-white whitespace-nowrap text-${textSize}`}>{amount.toFixed(2)}</span>
    </div>
  );
};
