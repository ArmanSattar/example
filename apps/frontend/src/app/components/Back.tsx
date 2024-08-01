import React from "react";
import BackArrow from "../../../public/icons/back-arrow.svg";
import { useRouter } from "next/navigation";

interface BackProps {
  text: string;
  to: string;
}

export const Back: React.FC<BackProps> = ({ text, to }) => {
  const router = useRouter();

  return (
    <div
      className={`flex items-center space-x-2 cursor-pointer group px-2 py-1 rounded-md hover:bg-white-800 transition-colors duration-200`}
      onClick={() => {
        router.push("/cases");
      }}
    >
      <BackArrow
        className={"w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-200"}
      />
      <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-200 whitespace-nowrap">
        {text}
      </span>
    </div>
  );
};
