import Image from "next/image";
import React, { useMemo } from "react";
import { Money } from "../../../components/Money";
import { BaseCaseItem } from "@solspin/game-engine-types";
import { useFetchImage } from "../hooks/useFetchImage";
import { GET_CASES_URL } from "../../../types";
import { toast } from "sonner";
import { wearToColorAndAbbrev } from "../utils";

interface CaseItemProps {
  item: BaseCaseItem;
}

export const CaseItem: React.FC<CaseItemProps> = ({ item }) => {
  const [wearAbbrev, wearColor] = wearToColorAndAbbrev.get(item.wear) || ["", "text-gray-400"];
  const typeAndName = item.name.split(" | ");
  const type = typeAndName[0];
  const name = typeAndName[1];
  const { data, isLoading, isError } = useFetchImage(`${GET_CASES_URL}${item.imagePath}`);

  const gradientText = useMemo(
    () => `case-${item.rarity.toLowerCase().replace(" ", "-")}-gradient`,
    [item]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    toast.error("Error fetching image");
    return <div>Error fetching image</div>;
  }

  return (
    <div
      className={`flex flex-row md:flex-col items-start p-4 overflow-hidden group min-w-[200px] max-w-[220px] rounded-lg border-2 border-white/30 bg-gradient-to-b from-[#3A3C3E] to-[#232527]`}
    >
      <div className="relative flex flex-col items-center justify-center rounded-lg min-w-[125px] md:w-full min-h-[125px]">
        <div className="relative flex justify-center items-center h-full w-full z-10">
          <div className={"absolute scale-125"}>
            <Image
              src={data || "/images/placeholder.png"}
              alt={`${item.name} - ${item.wear}`}
              width={250}
              height={250}
              objectFit="contain"
            />
          </div>
        </div>
        <div className={`absolute mx-auto inset-x-0 h-32 w-32 ${gradientText}`}></div>
      </div>
      <div className="flex flex-col justify-center items-start space-y-0.5 flex-grow px-2 w-full">
        <span className="text-white text-sm whitespace-nowrap font-">{name}</span>
        <span className="text-gray-400 text-2xs whitespace-nowrap">{type}</span>
        <span className={`${wearColor} text-2xs whitespace-nowrap`}>{item.wear}</span>
        <div className={"flex justify-between items-center w-full"}>
          <div className="rounded-2xl bg-dark py-0.5 px-2 border-[1px] border-black h-8 flex justify-center items-center whitespace-nowrap">
            <Money amount={item.price} textSize={"sm"} />
          </div>
          <div className="h-8 flex justify-center items-center whitespace-nowrap">
            <div className="relative w-full h-full">
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs duration-300 group-hover:opacity-0">
                {item.chance}%
              </span>
              <span className="absolute inset-0 flex items-center justify-center text-white text-2xs opacity-0 duration-300 group-hover:opacity-100">
                {item.rollNumbers[0]}-{item.rollNumbers[1]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
