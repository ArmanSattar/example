import Image from "next/image";
import React, { useMemo } from "react";
import { cn } from "../../cases/[id]/utils";

interface ProfileComponentProps {
  level: number;
  profileImageUrl?: string;
  size?: "small" | "medium" | "large";
}

const levelToColor = (level: number) => {
  if (level < 10) {
    return "#6B7280"; // gray-500
  } else if (level < 20) {
    return "#10B981"; // green-500
  } else if (level < 30) {
    return "#3B82F6"; // blue-500
  } else if (level < 50) {
    return "#FBBF24"; // yellow-400
  } else {
    return "#8B5CF6"; // purple-500
  }
};

const sizeConfig = {
  small: {
    container: "w-[20px] h-[25.6px] sm:w-[25px] sm:h-[32px]",
    profileContainer: "w-[20px] h-[20px] sm:w-[25px] sm:h-[25px] border",
    imageContainer: "w-[16px] h-[16px] sm:w-[20px] sm:h-[20px]",
    image: { width: 16, height: 16, className: "sm:w-[20px] sm:h-[20px]" },
    levelContainer: "min-w-[0.875rem] px-[2px] py-[1.6px] sm:px-[2.5px] sm:py-[2px] border",
    levelText: "text-[4px] sm:text-[6px]",
  },
  medium: {
    container: "w-[30px] h-[38.4px] sm:w-[37.5px] sm:h-[48px]",
    profileContainer: "w-[30px] h-[30px] sm:w-[37.5px] sm:h-[37.5px] border-2",
    imageContainer: "w-[24px] h-[24px] sm:w-[30px] sm:h-[30px]",
    image: { width: 24, height: 24, className: "sm:w-[30px] sm:h-[30px]" },
    levelContainer: "min-w-[1.3125rem] px-[3px] py-[2.4px] sm:px-[3.75px] sm:py-[3px] border-2",
    levelText: "text-[6px] sm:text-[9px]",
  },
  large: {
    container: "w-[40px] h-[51.2px] sm:w-[50px] sm:h-[64px]",
    profileContainer: "w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] border-2",
    imageContainer: "w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]",
    image: { width: 32, height: 32, className: "sm:w-[40px] sm:h-[40px]" },
    levelContainer: "min-w-[1.75rem] px-[4px] py-[3.2px] sm:px-[5px] sm:py-[4px] border-2",
    levelText: "text-[8px] sm:text-3xs",
  },
};

export const ProfileComponent: React.FC<ProfileComponentProps> = ({
  level,
  profileImageUrl,
  size = "large",
}) => {
  const levelColor = useMemo(() => levelToColor(level), [level]);
  const config = sizeConfig[size];

  return (
    <div className={cn("relative", config.container)}>
      <div
        className={cn(
          "relative rounded-full flex justify-center items-center p-1",
          config.profileContainer
        )}
        style={{ borderColor: levelColor }}
      >
        <div
          className={cn(
            "absolute bg-black rounded-full flex justify-center items-center overflow-clip",
            config.imageContainer
          )}
        >
          <Image
            src={profileImageUrl ? profileImageUrl : "/profile-placeholder.png"}
            alt="profile"
            {...config.image}
          />
        </div>
      </div>
      <div
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border-chatbar_bg inline-flex justify-center items-center z-30",
          config.levelContainer
        )}
        style={{ backgroundColor: levelColor }}
      >
        <span className={cn("text-black font-bold text-center", config.levelText)}>{level}</span>
      </div>
    </div>
  );
};
