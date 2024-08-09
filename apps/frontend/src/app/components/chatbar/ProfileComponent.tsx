import Image from "next/image";
import React, { useMemo } from "react";
import { cn } from "../../cases/[id]/utils";

interface ProfileComponentProps {
  level: number;
  profileImageUrl?: string;
  size?: "small" | "medium" | "large" | "xlarge";
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

const sizeClasses = {
  small: "scale-80",
  medium: "scale-100",
  large: "scale-[200%]",
  xlarge: "scale-[350%]",
};

export const ProfileComponent: React.FC<ProfileComponentProps> = ({
  level,
  profileImageUrl,
  size = "medium",
}) => {
  const levelColor = useMemo(() => levelToColor(level), [level]);

  return (
    <div
      className={cn(
        "relative flex-shrink-0 w-[40px] h-[51.2px] sm:w-[50px] sm:h-[64px]",
        sizeClasses[size]
      )}
    >
      <div
        className="relative rounded-full border-2 flex justify-center items-center w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] p-1"
        style={{ borderColor: levelColor }}
      >
        <div className="absolute bg-black rounded-full flex justify-center items-center overflow-clip w-[32px] h-[32px] sm:w-[40px] sm:h-[40px]">
          <Image
            src={profileImageUrl ? profileImageUrl : "/profile-placeholder.png"}
            alt="profile"
            width={32}
            height={32}
            className="sm:w-[40px] sm:h-[40px]"
          />
        </div>
      </div>
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 min-w-[1.75rem] rounded-full border-2 border-chatbar_bg inline-flex justify-center items-center z-30 px-[4px] py-[3.2px] sm:px-[5px] sm:py-[4px]"
        style={{ backgroundColor: levelColor }}
      >
        <span className="text-black text-[8px] sm:text-3xs font-bold text-center">{level}</span>
      </div>
    </div>
  );
};
