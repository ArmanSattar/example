import Image from "next/image";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Money } from "../../../components/Money";
import { BaseCaseItem } from "@solspin/game-engine-types";
import { GET_CASES_URL } from "../../../types";
import { useFetchImage } from "../hooks/useFetchImage";
import { toast } from "sonner";
import { CarouselItemSkeleton } from "./CarouselItemSkeleton";
import { Direction, ITEM_HEIGHT, ITEM_WIDTH } from "../utils";

interface CarouselItemProps {
  isMiddle: boolean;
  isFinal: boolean;
  animationEnd: boolean;
  animationStart: boolean;
  item: BaseCaseItem;
  direction: Direction;
}

const CarouselItem: React.FC<CarouselItemProps> = ({
  isMiddle,
  isFinal,
  animationEnd,
  animationStart,
  item,
  direction,
}) => {
  const [shouldScaleDown, setShouldScaleDown] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError } = useFetchImage(`${GET_CASES_URL}${item.imagePath}`);
  const [type, name] = useMemo(() => item.name.split(" | "), [item.name]);
  const isVertical = direction === Direction.VERTICAL;
  const gradientText = useMemo(
    () => `case-${item.rarity.toLowerCase().replace(" ", "-")}-gradient`,
    [item]
  );

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
    <div className={`w-[${ITEM_WIDTH}px] h-[${ITEM_HEIGHT}px]`}>
      <div
        className={`relative flex flex-col items-center justify-center w-full h-full rounded-xl ${
          isMiddle ? "opacity-100" : "opacity-30"
        }`}
      >
        <div
          ref={imageContainerRef}
          className={`relative h-full w-full flex justify-center items-center`}
        >
          <div
            className={`relative flex justify-center items-center h-[${ITEM_HEIGHT}px] w-[${ITEM_WIDTH}px]`}
          >
            <Image
              src={data || "/images/placeholder.png"}
              alt={"Case item"}
              width={ITEM_WIDTH}
              height={ITEM_HEIGHT}
            />
          </div>
          <div className={`h-full w-full absolute ${gradientText} -z-10`}></div>
        </div>
        {isFinal && isMiddle && (
          <div
            className={`flex flex-col items-center space-y-0.5 w-3/4 ${
              isFinal && isMiddle && animationEnd ? "-translate-y-5 duration-1000" : ""
            }`}
          >
            <span className={"text-white text-sm font-semibold whitespace-nowrap"}>{name}</span>
            <Money amount={item.price} />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(CarouselItem);
