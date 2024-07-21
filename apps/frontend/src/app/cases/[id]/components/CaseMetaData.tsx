import React from "react";

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
    <div className="flex flex-col justify-between items-start w-full space-y-4">
      <div className={"w-full flex justify-center items-center"}>
        <div className={`flex flex-col w-full justify-center items-center gap-2`}>
          <div className={"flex gap-2 justify-between items-center"}>
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
          </div>
          <div className="border-[1.5px] w-max border-purple-500 bg-purple-500 bg-opacity-20 rounded-md py-3 px-4 space-x-1 xl:text-md-1 2xl:space-x-3">
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
    </div>
  );
};
