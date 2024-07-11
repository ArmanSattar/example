import Image from "next/image";
import React from "react";
import { Money } from "../../../components/Money";
import { wearToColorAndAbbrev } from "./CarouselItem";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";

interface CaseItemProps {
  item: BaseCaseItem;
  activeCase: BaseCase;
}

export const CaseItem: React.FC<CaseItemProps> = ({ item, activeCase }) => {
  const [wearAbbrev, wearColor] = wearToColorAndAbbrev.get(item.wear) || ["", "text-gray-400"];
  const typeAndName = item.name.split(" | ");
  const name = typeAndName[0];
  const type = typeAndName[1];

  return (
    <div className="flex items-center rounded-md space-x-4 p-4 main-element overflow-hidden h-40 group min-w-[260px] max-w-[300px]">
      <div
        className="relative flex flex-col items-center justify-center bg-gray-900 border-black border-[1px] rounded-lg"
        style={{ width: 125, height: 125 }}
      >
        <div className="relative flex justify-center items-center h-full w-full scale-125 z-10">
          <Image
            src={item.imagePath}
            alt={`${item.name} - ${item.wear}`}
            width={125}
            height={125}
            objectFit="contain"
          />
        </div>
        <div
          className={`absolute bottom-0 right-0 w-full h-1/3 opacity-20 case-${item.rarity
            .toLowerCase()
            .replace(" ", "-")}-gradient`}
        ></div>
        <div
          className={`absolute bottom-2 w-3/4 h-0.5 case-${item.rarity
            .toLowerCase()
            .replace(" ", "-")}-beam`}
        ></div>
      </div>
      <div className="flex flex-col justify-center items-start space-y-1.5 flex-grow px-2">
        <span className={`${wearColor} text-2xs whitespace-nowrap`}>{item.wear}</span>
        <span className="text-gray-400 text-2xs whitespace-nowrap">{type}</span>
        <span className="text-white text-sm whitespace-nowrap">{name}</span>
        <Money amount={item.price} textSize={"sm"} />
        <div className="rounded-md bg-dark py-0.5 px-2 border-[1px] border-black h-8 flex justify-center items-center whitespace-nowrap w-full">
          <div className="relative w-full h-full">
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs duration-300 group-hover:opacity-0">
              {Math.round(item.chance * 10000) / 100}%
            </span>
            <span className="absolute inset-0 flex items-center justify-center text-white text-2xs opacity-0 duration-300 group-hover:opacity-100">
              {item.rollNumbers[0]}-{item.rollNumbers[1]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
