import Image from "next/image";
import React from "react";
import { ICase } from "../../hooks/useCases";

interface CarouselItemProps extends ICase {
  isMiddle: boolean;
}

const CarouselItem: React.FC<CarouselItemProps> = ({
  name,
  price,
  rarity,
  tag,
  image,
  isMiddle,
}) => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center opacity-80 duration-700 ease-in-out will-change-transform ${
        isMiddle ? "scale-110 opacity-100 brightness-125" : ""
      } w-[176px] h-[176px]`}
    >
      <div className="relative flex justify-center items-center h-full w-full">
        <Image src={image} alt={"case"} width={140} height={140} />
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

export default CarouselItem;
