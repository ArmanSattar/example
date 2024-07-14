import Image from "next/image";
import React, { memo, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { Money } from "../../../components/Money";
import { BaseCaseItem } from "@solspin/game-engine-types";
import { GET_CASES_URL } from "../../../types";
import { useFetchImage } from "../hooks/useFetchImage";
import { toast } from "sonner";
import { CarouselItemSkeleton } from "./CarouselItemSkeleton";

interface CarouselItemProps {
  isMiddle: boolean;
  isFinal: boolean;
  animationEnd: boolean;
  animationStart: boolean;
  item: BaseCaseItem;
}

export const wearToColorAndAbbrev = new Map<string, [string, string]>([
  ["Factory New", ["FN", "text-yellow-500"]],
  ["Minimal Wear", ["MW", "text-green-400"]],
  ["Field Tested", ["FT", "text-blue-400"]],
  ["Well Worn", ["WW", "text-orange-400"]],
  ["Battle Scarred", ["BS", "text-red-400"]],
]);

const CarouselItem: React.FC<CarouselItemProps> = ({
  isMiddle,
  isFinal,
  animationEnd,
  animationStart,
  item,
}) => {
  const [shouldScaleDown, setShouldScaleDown] = useState(false);
  const [isInfiniteAnimating, setIsInfiniteAnimating] = useState(false);
  const audioTickRef = useRef<HTMLAudioElement | null>(null);
  const audioChaChingRef = useRef<HTMLAudioElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const soundClicked = useSelector((state: RootState) => state.demo.soundClicked);
  const { data, isLoading, isError } = useFetchImage(`${GET_CASES_URL}${item.imagePath}`);

  const nameAndType = item.name.split(" | ");
  const type = nameAndType[0];
  const name = nameAndType[1];

  const [wearAbbrev, wearColor] = wearToColorAndAbbrev.get(item.wear) || ["", "text-gray-400"];

  useEffect(() => {
    if (isMiddle && soundClicked) {
      const audioToPlay = animationEnd ? audioChaChingRef.current : audioTickRef.current;

      if (audioToPlay) {
        audioToPlay.currentTime = 0;
        audioToPlay.play().catch((error) => console.error("Audio playback failed:", error));
      }

      if (!shouldScaleDown) {
        setShouldScaleDown(true);
      }
    }
  }, [isMiddle, soundClicked, animationEnd, shouldScaleDown]);

  useEffect(() => {
    if (animationStart) {
      setShouldScaleDown(false);
      setIsInfiniteAnimating(false);
    }
  }, [animationStart]);

  useEffect(() => {
    const imageContainer = imageContainerRef.current;
    if (!imageContainer) return;

    const handleTransitionEnd = () => {
      if (isFinal && isMiddle && animationEnd) {
        setIsInfiniteAnimating(true);
      }
    };

    imageContainer.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      imageContainer.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [isFinal, isMiddle, animationEnd]);
  if (isLoading) {
    return <CarouselItemSkeleton />;
  }

  if (isError) {
    toast.error("Error fetching image");
    return <div>Error fetching image</div>;
  }

  return (
    <>
      <audio ref={audioTickRef} src="/sounds/tick.wav" />
      <audio ref={audioChaChingRef} src="/sounds/cashier-cha-ching.mp3" />
      <div
        className={`relative flex flex-col items-center justify-center w-[192px] h-[192px] scale-90 opacity-50 will-change-transform ${
          isMiddle ? "animate-middle-item z-10" : shouldScaleDown ? "animate-scale-down" : ""
        }`}
      >
        <div
          ref={imageContainerRef}
          className={`relative flex justify-center items-center h-full w-full mt-10 ${
            isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000" : ""
          } ${isInfiniteAnimating ? "animate-final-item" : ""}`}
        >
          <Image
            src={data || "/images/placeholder.png"}
            alt={"Case item"}
            width={200}
            height={200}
          />
        </div>
        <div
          className={`absolute top-0 right-0 w-full h-full opacity-30 z-[-1] ${
            isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000" : ""
          } case-${item.rarity.toLowerCase().replace(" ", "-")} scale-125`}
        ></div>
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
      </div>
    </>
  );
};

export default memo(CarouselItem);
