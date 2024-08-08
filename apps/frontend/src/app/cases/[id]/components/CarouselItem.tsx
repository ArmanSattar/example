import Image from "next/image";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Money } from "../../../components/Money";
import { BaseCaseItem } from "@solspin/game-engine-types";
import { GET_CASES_URL } from "../../../types";
import { useFetchImage } from "../hooks/useFetchImage";
import { toast } from "sonner";
import { CarouselItemSkeleton } from "./CarouselItemSkeleton";
import { ITEM_WIDTH } from "../../../libs/constants";

interface CarouselItemProps {
  isMiddle: boolean;
  isFinal: boolean;
  animationEnd: boolean;
  animationStart: boolean;
  item: BaseCaseItem;
  dimension: { width: number; height: number };
}

const CarouselItem: React.FC<CarouselItemProps> = ({
  isMiddle,
  isFinal,
  animationEnd,
  animationStart,
  item,
  dimension,
}) => {
  const [shouldScaleDown, setShouldScaleDown] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError } = useFetchImage(`${GET_CASES_URL}${item.imagePath}`);
  const [type, name] = useMemo(() => item.name.split(" | "), [item.name]);
  const gradientText = useMemo(
    () => `case-${item.rarity.toLowerCase().replace(" ", "-")}-gradient`,
    [item]
  );
  const { width: itemWidth, height: itemHeight } = dimension;

  useEffect(() => {
    if (isMiddle && !shouldScaleDown) {
      setShouldScaleDown(true);
    }
  }, [isMiddle, animationEnd, shouldScaleDown]);

  useEffect(() => {
    if (animationStart) {
      setShouldScaleDown(false);
    }
  }, [animationStart]);

  if (isLoading) {
    return <CarouselItemSkeleton />;
  }

  if (isError) {
    toast.error("Error fetching image");
    return <div>Error fetching image</div>;
  }

  return (
    <div
      className={`will-change-transform ${
        isMiddle ? "animate-middle-item" : shouldScaleDown ? "animate-scale-down" : ""
      }`}
      style={{ width: `${itemWidth}px`, height: `${itemHeight}px` }}
    >
      <div
        className={`relative flex flex-col items-center justify-center w-full h-full rounded-xl ${
          isMiddle ? "opacity-100" : "opacity-30"
        }`}
      >
        <div
          ref={imageContainerRef}
          className="relative min-h-full min-w-full flex justify-center items-center overflow-visible"
        >
          <div
            className={`absolute flex justify-center items-center overflow-visible  ${
              isFinal && isMiddle && animationEnd ? "-translate-y-5 duration-1000" : ""
            }`}
            style={{ minHeight: `${itemHeight + 25}px`, minWidth: `${itemWidth + 25}px` }}
          >
            <Image
              src={data || "/images/placeholder.png"}
              alt="Case item"
              fill
              objectFit={"contain"}
            />
          </div>
          <div className={`min-h-full min-w-full absolute ${gradientText} -z-10`}></div>
        </div>
        {isFinal && isMiddle && animationEnd && (
          <div
            className={`absolute bottom-0 flex flex-col items-center ${
              itemWidth < ITEM_WIDTH ? "" : "space-y-0.5"
            } w-3/4 mb-4`}
          >
            <span
              className={`text-white ${
                itemWidth < ITEM_WIDTH ? "text-3xs" : "text-sm"
              } font-semibold whitespace-nowrap`}
            >
              {name}
            </span>
            <Money
              amount={item.price}
              textStyle={`${itemWidth < ITEM_WIDTH ? "text-2xs" : "text-sm"}`}
              className={"space-x-1 font-semibold"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(CarouselItem);
