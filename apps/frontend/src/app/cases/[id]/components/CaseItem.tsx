import Image from "next/image";
import React, { memo, useMemo } from "react";
import { Money } from "../../../components/Money";
import { BaseCaseItem } from "@solspin/game-engine-types";
import { useFetchImage } from "../hooks/useFetchImage";
import { GET_CASES_URL } from "../../../types";
import { toast } from "sonner";
import { wearToColorAndAbbrev } from "../utils";
import Tooltip from "../../../components/ToolTip";

interface CaseItemProps {
  item: BaseCaseItem;
}

export const CaseItem: React.FC<CaseItemProps> = memo(({ item }) => {
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
      className={`flex flex-col items-start p-4 group min-w-[200px] max-w-[220px] bg-navbar_bg element-with-stroke`}
    >
      <div className="relative flex flex-col items-center justify-center rounded-lg min-w-[125px] w-full min-h-[125px]">
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
        <div className={`absolute mx-auto inset-x-0 h-32 w-32 ${gradientText} opacity-40`}></div>
      </div>
      <div
        className={`flex flex-col justify-center items-start space-y-0.5 flex-grow px-0 lg:px-2 w-full`}
      >
        <span className="font-bold text-white text-sm whitespace-nowrap">{name}</span>
        <span className="text-2xs whitespace-nowrap text-[#98A0C3]">{type}</span>
        <span className={`${wearColor} text-2xs whitespace-nowrap`}>{item.wear}</span>
        <div className={"flex justify-between items-center w-full"}>
          <div className="rounded-2xl py-0.5 px-2 bg-[#181B1D] h-8 flex justify-center items-center whitespace-nowrap">
            <Money amount={item.price} textStyle={"text-sm"} />
          </div>
          <div>
            <Tooltip text={`Roll numbers: ${item.rollNumbers[0]} - ${item.rollNumbers[1]}`}>
              <div className="relative w-full h-full flex justify-between items-center space-x-1">
                <Image src={"/icons/dice.svg"} alt={"Dice"} width={16} height={16} />
                <span className="text-[#98A0C3] text-sm whitespace-nowrap text-right">
                  {item.chance}
                </span>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
});

CaseItem.displayName = "CaseItem";
