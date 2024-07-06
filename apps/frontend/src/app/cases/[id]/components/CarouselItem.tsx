import Image from "next/image";
import React, { memo } from "react";
import { ICarouselItem } from "../page";

interface CarouselItemProps extends ICarouselItem {
  isMiddle: boolean;
  isFinal: boolean;
  animationEnd: boolean;
}

const CarouselItem: React.FC<CarouselItemProps> = ({
  imagePath,
  name,
  price,
  rarity,
  isMiddle,
  id,
  isFinal,
  animationEnd,
}) => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center w-[192px] h-[192px] scale-90 opacity-50 ${
        isMiddle ? "animate-middle-item" : ""
      }`}
    >
      <div
        className={`relative flex justify-center items-center h-full w-full ${
          isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000" : ""
        }`}
      >
        <Image src={imagePath} alt={"case"} width={175} height={175} />
      </div>
      <div
        className={`absolute top-0 right-0 w-full h-full opacity-30 z-[-1] ${
          isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000" : ""
        }`}
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgb(235, 76, 75) 0%, rgba(74, 34, 34, 0.2) 100%)",
        }}
      ></div>
      <div
        className={`flex flex-col items-center space-y-1 w-3/4 opacity-0 mt-2 ${
          isFinal && isMiddle && animationEnd ? "-translate-y-10 duration-1000 opacity-100" : ""
        }`}
      >
        <span className={"text-white font-semibold"}>{name}</span>
        <span className={"text-white font-semibold"}>{price}</span>
      </div>
    </div>
  );
};

export default memo(CarouselItem);
