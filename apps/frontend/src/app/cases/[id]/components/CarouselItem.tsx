import Image from "next/image";
import React from "react";
import { ICase } from "../../hooks/useCases";

export const CarouselItem: React.FC<ICase> = ({ name, price, rarity, tag, image }) => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center transition-transform duration-300`}
      style={{ width: 176, height: 176 }}
    >
      <div className="relative flex justify-center items-center h-full w-full">
        <Image src={image} alt={"case"} width={140} height={140} />
      </div>
      <div
        className="absolute top-0 right-0 w-full h-full opacity-30 z-[-1]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgb(235, 76, 75) 0%, rgba(74, 34, 34, 0) 100%)",
        }}
      ></div>
    </div>
  );
};
