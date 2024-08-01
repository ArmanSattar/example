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
      className={`w-[${ITEM_WIDTH}px] h-[${ITEM_HEIGHT}px] ${
        direction === Direction.VERTICAL ? "p-1" : "p-0.5"
      }`}
    >
      <div
        className={`relative flex flex-col items-center justify-center w-full h-full rounded-xl overflow-clip will-change-transform ${
          isMiddle && isFinal && animationEnd ? "animate-final" : ""
        } ${isMiddle ? "opacity-100" : "opacity-75"}`}
      >
        <div
          ref={imageContainerRef}
          className={`h-full w-full ${
            isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000" : ""
          }`}
        >
          <div className={`relative flex justify-center items-center h-full w-full mt-8`}>
            <Image
              src={data || "/images/placeholder.png"}
              alt={"Case item"}
              width={200}
              height={200}
              objectFit="contain"
            />
          </div>
        </div>
        <div
          className={`flex flex-col items-center space-y-0.5 w-3/4 opacity-0 -mt-5 ${
            isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000 opacity-100" : ""
          }`}
        >
          <span className={"text-white text-sm font-semibold whitespace-nowrap"}>{name}</span>
          <Money amount={item.price} />
        </div>
      </div>
    </div>
  );
};

export default memo(CarouselItem);
