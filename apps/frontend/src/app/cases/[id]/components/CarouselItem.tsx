import Image from "next/image";
import React, { memo } from "react";
import { ICarouselItem } from "../page";

interface CarouselItemProps extends ICarouselItem {
  isMiddle: boolean;
}

const CarouselItem: React.FC<CarouselItemProps> = ({ imagePath, isMiddle, id }) => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center w-[176px] h-[176px] scale-90 opacity-50 ${
        isMiddle ? "animate-middle-item" : ""
      }`}
    >
      <div className="relative flex justify-center items-center h-full w-full">
        <Image src={imagePath} alt={"case"} width={140} height={140} />
      </div>
      <div
        className="absolute top-0 right-0 w-full h-full opacity-30 z-[-1]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgb(235, 76, 75) 0%, rgba(74, 34, 34, 0.2) 100%)",
        }}
      ></div>
    </div>
  );
};

export default memo(CarouselItem);
