"use client";

import React from "react";
import Image from "next/image";

interface ProfilePictureWithEditProps {
  profilePictureURL?: string;
}

export const ProfilePictureWithEdit: React.FC<ProfilePictureWithEditProps> = ({
  profilePictureURL,
}) => {
  return (
    <div className="relative w-32 aspect-square rounded-full">
      <Image
        src={profilePictureURL || "/profile-placeholder.png"}
        alt="profile"
        fill
        style={{ objectFit: "contain" }}
      />
      <div
        className="absolute bottom-1 right-1 w-9 h-9 rounded-full p-1 bg-gray-200 border-[3px] border-color_gray_3 cursor-pointer"
        onClick={() => console.log("Change profile picture")}
      >
        <div className="relative z-10 w-6 h-6">
          <Image src="/icons/pen.svg" alt="Pen" fill style={{ objectFit: "contain" }} />
        </div>
      </div>
    </div>
  );
};
