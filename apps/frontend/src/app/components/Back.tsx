import React from "react";
import BackArrow from "../../../public/icons/back-arrow.svg";
import { useRouter } from "next/navigation";
import { cn } from "../cases/[id]/utils";

interface BackProps {
  text?: string;
  to: string;
  customStyle?: string;
}

export const Back: React.FC<BackProps> = ({ text, to, customStyle }) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        `flex items-center space-x-2 cursor-pointer group hover:bg-white-800 hover:bg-color_gray_3 duration-250 ease-in-out rounded-md px-2 py-3 transition-colors duration-200`,
        customStyle
      )}
      onClick={() => {
        router.push("/cases");
      }}
    >
      <BackArrow
        className={"w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-200"}
      />
      {text && (
        <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-200 whitespace-nowrap">
          {text}
        </span>
      )}
    </div>
  );
};
