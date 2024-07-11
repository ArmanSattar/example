import React from "react";
import Image from "next/image";
import { CaseMetaData } from "./CaseMetaData";

interface CaseDetailsProps {
  name: string;
  price: number;
  rarity: string;
  tag: string;
  imagePath: string;
}

export const CaseDetails: React.FC<CaseDetailsProps> = ({
  name,
  price,
  rarity,
  tag,
  imagePath,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-start sm:items-center items-start w-full space-y-4">
      <div className="relative">
        <Image
          src={imagePath}
          alt={name}
          height={100}
          width={225}
          objectFit="contain"
          className="object-contain"
        />
      </div>
      <CaseMetaData
        name={name}
        highestPrice={200}
        lowestPrice={1}
        totalItems={12}
        price={price}
        label={tag}
      />
    </div>
  );
};
