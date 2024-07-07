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
      className={`flex items-center space-x-2 cursor-pointer group`}
      onClick={() => {
        router.push("/cases");
      }}
    >
      <BackArrow className={"w-12 h-7 text-gray-400 group-hover:text-gray-300 duration-100"} />
      <span className="text-gray-400 text-sm group-hover:text-gray-300 duration-100">{text}</span>
    </div>
  );
};
