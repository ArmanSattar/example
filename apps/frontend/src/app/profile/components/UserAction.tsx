import { cn } from "../../cases/[id]/utils";

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
  isOn = true,
}) => {
  return (
    <div
      className="flex justify-start items-center rounded-md bg-color_gray_4 shadow-lg w-full p-4 gap-x-6 h-28 cursor-pointer hover:scale-[102.5%] duration-300 ease-in-out "
      onClick={() => {
        onClick();
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
