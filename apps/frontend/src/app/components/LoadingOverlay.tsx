import React from "react";
import { Spinner } from "./Spinner";
import Image from "next/image";

interface LoadingOverlayProps {
  isLoading?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (isLoading !== undefined && isLoading === false) return null;

  return (
    <div className="absolute w-screen h-screen flex flex-col inset-0 bg-main_background justify-center items-center z-[999]">
      <div className="flex relative items-center w-[320px] h-[320px] justify-center border-color_gray_3">
        <Image
          src="/icons/logo.webp"
          alt="logo"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 60px, (max-width: 1024px) 80px, 320px"
          priority={true}
        />
      </div>
      <Spinner size="medium" color="text-color_primary" />
    </div>
  );
};

export default LoadingOverlay;
