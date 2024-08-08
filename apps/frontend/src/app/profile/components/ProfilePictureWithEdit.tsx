"use client";

import React, { useRef } from "react";
import Image from "next/image";

interface ProfilePictureWithEditProps {
  profilePictureURL?: string;
  handleProfilePictureChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfilePictureWithEdit: React.FC<ProfilePictureWithEditProps> = ({
  profilePictureURL,
  handleProfilePictureChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative w-32 aspect-square rounded-full">
      <Image
        src={profilePictureURL || "/profile-placeholder.png"}
        alt="profile"
        fill
        style={{ objectFit: "contain" }}
      />
      <div
        className="absolute bottom-1 right-1 w-9 h-9 rounded-full p-1 bg-gray-200 border-[3px] border-color_gray_4 cursor-pointer z-20"
        onClick={handleClick}
      >
        <div className="relative z-10 w-6 h-6">
          <Image src="/icons/pen.svg" alt="Pen" fill style={{ objectFit: "contain" }} />
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleProfilePictureChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
