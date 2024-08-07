import React from "react";
import { Tag } from "../../components/Tag";
import { Back } from "../../../components/Back";
import { Money } from "../../../components/Money";

interface CaseMetaDataProps {
  name: string;
  highestPrice: number;
  lowestPrice: number;
  price: number;
  label: string;
}

export const CaseMetaData: React.FC<CaseMetaDataProps> = ({
  name,
  highestPrice,
  lowestPrice,
  price,
  label,
}) => {
  return (
    <div className="flex flex-col justify-between items-start w-full space-y-4 -mt-8 sm:mt-0">
      <div className={"w-full flex items-start justify-between"}>
        <div className="flex gap-6 justify-between items-center">
          <span className="text-white font-bold text-3xl">{name}</span>
          {label !== "" && <Tag name={label} customStyle={"text-md py-0.5 px-2"} />}
        </div>
        <Back text="Back to Cases" to={""} customStyle={"hidden xl:flex"} />
      </div>
      <div
        className={`flex flex-col space-y-1 lg:flex-row lg:space-x-1 lg:space-y-0 justify-between items-center`}
      >
        <div className={`flex items-center gap-2`}>
          <div className={"flex gap-x-1 justify-center items-center"}>
            <span className="text-gray-400 text-md uppercase">Lowest Item</span>
            <Money amount={lowestPrice} textStyle={"text-md"} className={"space-x-1"} />
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="4"
            height="4"
            viewBox="0 0 4 4"
            fill="none"
          >
            <circle cx="2" cy="2" r="2" fill="#d1d5db" />
          </svg>
          <div className={"flex gap-x-1 justify-center items-center"}>
            <span className="text-gray-400 text-md uppercase">Highest Item</span>
            <Money amount={highestPrice} textStyle={"text-md"} className={"space-x-1"} />
          </div>
        </div>
      </div>
    </div>
  );
};
