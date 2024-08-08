import { cn } from "../../cases/[id]/utils";
import { useState } from "react";

interface UserActionProps {
  title: string;
  subtitle?: string;
  SvgOn: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  SvgOff?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  svgOnColor: string;
  svgOffColor?: string;
  onClick: () => void;
  isOn?: boolean;
}

export const UserAction: React.FC<UserActionProps> = ({
  title,
  SvgOn,
  svgOnColor,
  svgOffColor,
  SvgOff,
  subtitle,
  onClick,
}) => {
  const [isOn, setIsOn] = useState(true);

  return (
    <div
      className="flex justify-start items-center rounded-md bg-color_gray_4 shadow-lg w-full p-4 gap-x-[1vw] h-28 hover:cursor-pointer"
      onClick={() => {
        onClick();
        setIsOn(!isOn);
      }}
    >
      {!isOn && SvgOff ? (
        <SvgOff className={cn(`w-16 h-16 text-gray-400`, svgOffColor)} />
      ) : (
        <SvgOn className={cn(`w-16 h-16 text-gray-400`, svgOnColor)} />
      )}
      <div className={"flex flex-col justify-between items-start w-full"}>
        <div className="text-white text-sm mt-2 font-semibold">{title}</div>
        <div className="text-gray-400 text-xs mt-1">{subtitle}</div>
      </div>
    </div>
  );
};
