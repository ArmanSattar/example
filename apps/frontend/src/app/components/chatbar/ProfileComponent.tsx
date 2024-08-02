import Image from "next/image";
import React, { useMemo } from "react";

interface ProfileComponentProps {
  level: number;
  profilePic?: string;
}

const levelToColor = (level: number) => {
  if (level < 10) {
    return "gray-500";
  } else if (level < 20) {
    return "green-500";
  } else if (level < 30) {
    return "blue-500";
  } else if (level < 50) {
    return "yellow-400";
  } else {
    return "purple-500";
  }
};

export const ProfileComponent: React.FC<ProfileComponentProps> = ({ level, profilePic }) => {
  const levelColor = useMemo(() => levelToColor(level), [level]);
  console.log(`border-${levelColor}`);
  return (
    <div className="relative flex-shrink-0 w-[50px] h-[64px]">
      <div
        className={`relative rounded-full border-${levelColor} border-2 flex justify-center items-center w-[50px] h-[50px] p-1`}
      >
        <div className="absolute bg-black rounded-full flex justify-center items-center overflow-clip">
          <Image
            src={profilePic ? profilePic : "/icons/portrait-09.png"}
            alt="profile"
            width={40}
            height={40}
          />
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-${levelColor} border-2 border-chatbar_bg inline-flex justify-center items-center z-30 px-[5px] py-[4px]`}
      >
        <span className="text-black text-3xs font-bold text-center">{level}</span>
      </div>
    </div>
  );
};
