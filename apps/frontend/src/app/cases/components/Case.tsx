import React from "react";
import Image from "next/image";
import { Tag } from "./Tag";
import Link from "next/link";
import Dollar from "../../../../public/icons/dollar.svg";
import { BaseCase } from "@solspin/game-engine-types";
import { GET_CASES_URL } from "../../types";

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
  const CaseContent = () => (
    <div
      className={`relative rounded-md ${
        disableClick ? "" : "hover:cursor-pointer"
      } shadow-lg case cases-${rarity.toLowerCase().replace(" ", "-")} p-2 group overflow-hidden`}
    >
      <Tag name={tag} customStyle={"absolute top-4 left-4"} />
      <div className="relative -top-4">
        <Image
          src={`${GET_CASES_URL}${imagePath}`}
          alt={name}
          width={250}
          height={100}
          objectFit="contain"
          className="group-hover:scale-95 duration-300 ease-in-out"
        />
      </div>
      <div className="absolute bottom-6 inset-x-0 flex justify-between items-end">
        <div className="absolute left-4">
          <span className="text-white font-bold text-sm absolute bottom-0 left-0 group-hover:opacity-0 transition-opacity duration-300">
            {name}
          </span>
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
            <Dollar className="text-yellow-500" />
            <div className="h-5 flex items-center justify-center">
              <span className="text-white">{price}</span>
            </div>
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
