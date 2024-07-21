import React from "react";
import { Tag } from "../../components/Tag";

interface CaseMetaDataProps {
  name: string;
  highestPrice: number;
  lowestPrice: number;
  totalItems: number;
  label: string;
}

export const CaseMetaData: React.FC<CaseMetaDataProps> = ({
  name,
  highestPrice,
  lowestPrice,
  totalItems,
  label,
}) => {
  return (
    <div className="flex flex-col justify-between items-start w-3/5 space-y-4">
      <div className="flex gap-6 justify-between items-center mb-4">
        <span className="text-white font-bold text-3xl">{name}</span>
        {label !== "" && <Tag name={label} customStyle={"!text-lg !px-3"} />}
      </div>
      <div className={"w-full flex justify-center items-center"}>
        <div className={`flex justify-between items-center w-full`}>
          <div className="border-[1.5px] border-purple-500 bg-purple-500 bg-opacity-20 rounded-md py-3 px-4 space-x-1 2xl:space-x-3">
            <span className="text-white opacity-50 text-sm whitespace-nowrap xl:text-md-1 2xl:text-lg">
              Highest Item
            </span>
            <span className="text-white text-sm xl:text-lg">·</span>
            <span className="text-white text-sm whitespace-nowrap xl:text-md-1 2xl:text-lg">
              ${highestPrice}
            </span>
          </div>
          <div className="border-[1.5px] border-purple-500 bg-purple-500 bg-opacity-20 rounded-md py-3 px-4 space-x-1 2xl:space-x-3">
            <span className="text-white opacity-50 text-sm whitespace-nowrap xl:text-md-1 2xl:text-lg">
              Lowest Item
            </span>
            <span className="text-white text-sm xl:text-lg">·</span>
            <span className="text-white text-sm whitespace-nowrap xl:text-md-1 2xl:text-lg">
              ${lowestPrice}
            </span>
          </div>
          <div className="border-[1.5px] border-purple-500 bg-purple-500 bg-opacity-20 rounded-md py-3 px-4 space-x-1 xl:text-md-1 2xl:space-x-3">
            <span className="text-white opacity-50 text-sm whitespace-nowrap xl:text-md-1 2xl:text-lg">
              Total Items
            </span>
            <span className="text-white text-sm xl:text-lg">·</span>
            <span className="text-white text-sm whitespace-nowrap xl:text-md-1 2xl:text-lg">
              {totalItems}
            </span>
          </div>
        </div>
      </div>
      <div
        className={`w-full border-[1.5px] border-green-400 bg-green-400 bg-opacity-20 rounded-md flex justify-center items-center p-6`}
      >
        <p className="text-white font-light text-md xl:text-lg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </div>
    </div>
  );
};
