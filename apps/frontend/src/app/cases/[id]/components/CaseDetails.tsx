import React from "react";
import Image from "next/image";
import { CaseMetaData } from "./CaseMetaData";
import { GET_CASES_URL } from "../../../types";

interface CaseDetailsProps {
  name: string;
  price: number;
  tag: string;
  imagePath: string;
  highestPrice: number;
  lowestPrice: number;
  numberOfItems: number;
}

export const CaseDetails: React.FC<CaseDetailsProps> = ({
  name,
  price,
  tag,
  imagePath,
  highestPrice,
  lowestPrice,
  numberOfItems,
}) => {
  return (
    <div className="relative flex flex-col sm:flex-row justify-start sm:items-center items-start w-full sm:gap-4 xl:-mt-10">
      <div className="relative flex justify-center sm:justify-start items-center w-full sm:w-max">
        <div className="flex relative justify-center items-center min-w-[320px] min-h-[320px] -mt-4 xl:-mt-10">
          <Image
            src={`${GET_CASES_URL}${imagePath}`}
            alt={name}
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>
      <CaseMetaData
        name={name}
        highestPrice={highestPrice}
        lowestPrice={lowestPrice}
        price={price}
        label={tag}
      />
    </div>
  );
};
