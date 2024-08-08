import React, { useMemo } from "react";
import Image from "next/image";
import { Tag } from "./Tag";
import Link from "next/link";
import { BaseCase } from "@solspin/game-engine-types";
import { GET_CASES_URL } from "../../types";
import { Money } from "../../components/Money";

interface CaseProps extends BaseCase {
  disableClick?: boolean;
}

const Case: React.FC<CaseProps> = ({
  name,
  price,
  rarity,
  tag,
  imagePath,
  highestPrice,
  lowestPrice,
  disableClick = false,
}) => {
  const caseStyle = useMemo(() => `cases-${rarity.toLowerCase().replace(" ", "-")}`, [rarity]);

  const CaseContent = () => (
    <div
      className={`relative rounded-md ${
        disableClick ? "" : "hover:cursor-pointer"
      } shadow-lg case ${caseStyle} p-2 group overflow-hidden hover:!bg-hover_primary_color hover:shadow-md hover:shadow-hover_primary_color_50 transition-all duration-300 ease-in-out hover:scale-[101%]`}
    >
      <Tag name={tag} customStyle={"absolute top-4 left-4"} />
      <div className="absolute inset-0 m-auto w-64 h-64 -mt-2">
        <Image
          src={`${GET_CASES_URL}${imagePath}`}
          alt={name}
          fill
          objectFit="contain"
          className="group-hover:scale-105 duration-300 ease-in-out scale-110"
        />
      </div>
      <div className="absolute bottom-6 inset-x-0 flex justify-between items-end">
        <div className="absolute left-4">
          <div className={"w-full h-full"}>
            <span className="text-gray-400 font-bold text-3xs uppercase absolute bottom-5 left-0 group-hover:opacity-0 transition-opacity duration-300">
              {rarity}
            </span>
            <span className="text-white font-bold text-sm absolute bottom-0 left-0 group-hover:opacity-0 transition-opacity duration-300">
              {name}
            </span>
          </div>
          <div className="flex-col items-start justify-start w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
            <span className="text-white font-bold text-xs opacity-50 block mb-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">
              Least expensive item · ${lowestPrice}
            </span>
            <span className="text-white font-bold text-sm block whitespace-nowrap overflow-hidden text-ellipsis w-full">
              Most expensive item · ${highestPrice}
            </span>
          </div>
        </div>
        <div className="absolute right-4">
          <div className="flex items-end justify-end gap-1 group-hover:opacity-0 transition-opacity duration-300">
            <Money amount={price} textStyle={"text-white font-semibold"} className={"space-x-1"} />
          </div>
        </div>
      </div>
    </div>
  );

  return disableClick ? (
    <CaseContent />
  ) : (
    <Link href={`/cases/${name.toLowerCase().replace(/ /g, "-")}`}>
      <CaseContent />
    </Link>
  );
};

export default Case;
