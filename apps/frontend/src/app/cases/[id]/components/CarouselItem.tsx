import Image from "next/image";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { Money } from "../../../components/Money";
import { BaseCaseItem } from "@solspin/game-engine-types";
import { GET_CASES_URL } from "../../../types";
import { useFetchImage } from "../hooks/useFetchImage";
import { toast } from "sonner";
import { CarouselItemSkeleton } from "./CarouselItemSkeleton";
import { Direction, ITEM_HEIGHT, ITEM_WIDTH, wearToColorAndAbbrev } from "../utils";

interface CarouselItemProps {
  isMiddle: boolean;
  isFinal: boolean;
  animationEnd: boolean;
  animationStart: boolean;
  item: BaseCaseItem;
  direction: Direction;
}

const TICK_SOUND = "/sounds/tick.wav";
const CHA_CHING_SOUND = "/sounds/cashier-cha-ching.mp3";

const CarouselItem: React.FC<CarouselItemProps> = ({
  isMiddle,
  isFinal,
  animationEnd,
  animationStart,
  item,
  direction,
}) => {
  const [shouldScaleDown, setShouldScaleDown] = useState(false);
  const [isInfiniteAnimating, setIsInfiniteAnimating] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const soundClicked = useSelector((state: RootState) => state.demo.soundClicked);
  const { data, isLoading, isError } = useFetchImage(`${GET_CASES_URL}${item.imagePath}`);
  const [type, name] = useMemo(() => item.name.split(" | "), [item.name]);
  const [wearAbbrev, wearColor] = useMemo(
    () => wearToColorAndAbbrev.get(item.wear) || ["", "text-gray-400"],
    [item.wear]
  );

  const isVertical = direction === Direction.VERTICAL;

  const playSound = useCallback((src: string) => {
    const audio = new Audio(src);
    audio.play().catch((error) => console.error("Audio playback failed:", error));
  }, []);

  useEffect(() => {
    if (isMiddle && soundClicked) {
      const soundSrc = animationEnd ? CHA_CHING_SOUND : TICK_SOUND;
      playSound(soundSrc);

      if (!shouldScaleDown) {
        setShouldScaleDown(true);
      }
    }
  }, [isMiddle, soundClicked, animationEnd, shouldScaleDown, playSound]);

  useEffect(() => {
    if (animationStart) {
      setShouldScaleDown(false);
      setIsInfiniteAnimating(false);
    }
  }, [animationStart]);

  const handleTransitionEnd = useCallback(() => {
    if (isFinal && isMiddle && animationEnd) {
      setIsInfiniteAnimating(true);
    }
  }, [isFinal, isMiddle, animationEnd]);

  useEffect(() => {
    const imageContainer = imageContainerRef.current;
    if (!imageContainer) return;

    imageContainer.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      imageContainer.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [isFinal, isMiddle, animationEnd, handleTransitionEnd]);

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
        className={`relative flex flex-col items-center justify-center w-full h-full opacity-50 case-${item.rarity
          .toLowerCase()
          .replace(" ", "-")}-container${
          isMiddle ? "-highlight !opacity-100" : ""
        } rounded-xl overflow-clip will-change-transform ${
          isMiddle && isFinal && animationEnd ? "animate-final" : ""
        }`}
      >
        <div className={`case-${item.rarity.toLowerCase().replace(" ", "-")}-blur`}></div>
        <div
          ref={imageContainerRef}
          className={`h-full w-full ${
            isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000" : ""
          }`}
        >
          <div
            className={`relative flex justify-center items-center h-full w-full mt-8 scale-110 ${
              isInfiniteAnimating
                ? "animate-final-item scale-125 brightness-110"
                : isMiddle
                ? "animate-middle-item"
                : shouldScaleDown
                ? "animate-scale-down"
                : ""
            } case-${item.rarity.toLowerCase().replace(" ", "-")}-shadow`}
          >
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
          className={`flex flex-col items-center space-y-1 w-3/4 opacity-0 ${
            isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000 opacity-100" : ""
          }`}
        >
          <div className="flex items-center justify-center w-full space-x-1 overflow-visible whitespace-nowrap">
            <span className={`font-light italic text-xs ${wearColor}`}>{item.wear}</span>
          </div>
          <div className="flex items-center justify-center w-full space-x-1 overflow-visible whitespace-nowrap">
            <span className={"text-white text-sm font-semibold"}>{type}</span>
            <span className={"text-gray-200 text-sm font-light"}>|</span>
            <span className={"text-white text-sm font-semibold"}>{name}</span>
          </div>
          <Money amount={item.price} />
        </div>
        <div
          className={`absolute -bottom-10 inset-x-0 w-full h-2/5 opacity-30 case-${item.rarity
            .toLowerCase()
            .replace(" ", "-")}-gradient -z-10`}
        ></div>
        <div
          className={`absolute inset-x-0 bottom-0.5 w-full h-2 case-${item.rarity
            .toLowerCase()
            .replace(" ", "-")}-beam brightness-150`}
        ></div>
      </div>
    </div>
  );
};

export default memo(CarouselItem);
