import Image from "next/image";
import React, { memo } from "react";
import { CaseItem } from "../page";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import Dollar from "../../../../../public/icons/dollar.svg";

interface CarouselItemProps extends CaseItem {
  isMiddle: boolean;
  isFinal: boolean;
  animationEnd: boolean;
}

const wearToColorAndAbbrev = new Map<string, [string, string]>([
  ["Factory New", ["FN", "text-yellow-500"]],
  ["Minimal Wear", ["MW", "text-green-400"]],
  ["Field-Tested", ["FT", "text-blue-400"]],
  ["Well-Worn", ["WW", "text-orange-400"]],
  ["Battle-Scarred", ["BS", "text-red-400"]],
]);

const CarouselItem: React.FC<CarouselItemProps> = ({
  imagePath,
  name,
  price,
  rarity,
  isMiddle,
  isFinal,
  animationEnd,
  rollNumbers,
  type,
  wear,
  chance,
}) => {
  const [shouldScaleDown, setShouldScaleDown] = React.useState(false);
  const audioTickRef = React.useRef<HTMLAudioElement | null>(null);
  const audioChaChingRef = React.useRef<HTMLAudioElement | null>(null);
  const soundClicked = useSelector((state: RootState) => state.demo.soundClicked);

  const [wearAbbrev, wearColor] = wearToColorAndAbbrev.get(wear) || ["", "text-gray-400"];

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

  return (
    <>
      <audio ref={audioTickRef} src="/sounds/tick.wav" />
      <audio ref={audioChaChingRef} src="/sounds/cashier-cha-ching.mp3" />
      <div
        className={`relative flex flex-col items-center justify-center w-[192px] h-[192px] scale-90 opacity-50 ${
          isMiddle ? "animate-middle-item z-10" : shouldScaleDown ? "animate-scale-down" : ""
        }`}
      >
        <div
          className={`relative flex justify-center items-center h-full w-full mt-10 ${
            isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000" : ""
          }`}
        >
          <Image src={imagePath} alt={"case"} width={175} height={175} />
        </div>
        <div
          className={`absolute top-0 right-0 w-full h-full opacity-30 z-[-1] ${
            isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000" : ""
          } case-${rarity.toLowerCase().replace(" ", "-")} scale-125`}
        ></div>
        <div
          className={`flex flex-col items-center space-y-1 w-3/4 opacity-0 ${
            isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000 opacity-100" : ""
          }`}
        >
          <div className="flex items-center justify-center w-full space-x-1 overflow-visible whitespace-nowrap">
            <span className={`font-light italic text-xs ${wearColor}`}>{wear}</span>
            <span className={"font-light italic text-xs text-gray-300"}>·</span>
            <span className={"font-light italic text-xs text-gray-300"}>{type}</span>
          </div>
          <span className={"text-white font-semibold"}>{name}</span>
          <div className="flex items-center justify-center w-full space-x-1">
            <Dollar className={"text-yellow-400"} />
            <span className={"text-white font-semibold"}>{price}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(CarouselItem);
