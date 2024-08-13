"use client";

import React, { useCallback } from "react";
import { ProfilePictureWithEdit } from "./ProfilePictureWithEdit";
import axios from "axios";
import { toast } from "sonner";
import { User } from "@solspin/user-management-types";

interface UserHeaderProps {
  user: User;
  updateUser: (updatedUserData: Partial<User>) => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ user, updateUser }) => {
  const handleProfilePictureChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];

        try {
          // Step 1: Get a pre-signed URL from the API
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_USER_MANAGEMENT_API_URL}/user/upload-image`,
            {
              contentType: file.type,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (response.status !== 200) {
            toast.error("Failed to get upload URL.");
            return;
          }

          const { uploadUrl, imageUrl } = response.data;
          console.log(uploadUrl);
          // Step 2: Upload the file to S3 using the pre-signed URL
          const uploadResponse = await axios.put(uploadUrl, file, {
            headers: {
              "Content-Type": file.type,
            },
          });

          if (uploadResponse.status !== 200) {
            toast.error("Failed to upload image.");
            return;
          }

          // Step 3: Update user profile with the new profile picture URL
          const updateResponse = await axios.put(
            `${process.env.NEXT_PUBLIC_USER_MANAGEMENT_API_URL}/user`,
            {
              updateFields: {
                profileImageUrl: imageUrl,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (updateResponse.status === 200) {
            updateUser({ profileImageUrl: imageUrl });
            toast.success("Profile picture updated successfully!");
          } else {
            toast.error("Failed to update profile picture.");
          }
        } catch (error) {
          toast.error("Error updating profile picture.");
        }
      }
    },
    [updateUser]
  );

  if (!user) {
    return null;
  }

  return (
    <div className={"flex flex-col gap-y-2"}>
      <span className={"uppercase text-white text-lg font-bold"}>Profile</span>
      <div className="flex flex-col justify-between mx-auto p-10 rounded-xl bg-color_gray_4 relative gap-y-4 shadow-lg">
        <div className={"relative w-full flex justify-center items-center scale-125"}>
          <ProfilePictureWithEdit
            profileImageUrl={user ? user.profileImageUrl : undefined}
            handleProfilePictureChange={handleProfilePictureChange}
          />
        </div>
        <div className={"flex flex-col gap-y-1 justify-between items-start w-full"}>
          <div className="text-white text-xl font-bold">{user.username}</div>
          {/*<div className="text-gray-400">{user.level}</div>*/}
          {/*<div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">*/}
          {/*  <div*/}
          {/*    className="bg-green-500 h-full rounded-full w-full "*/}
          {/*    style={{ width: `${45}%` }}*/}
          {/*  ></div>*/}
          {/*</div>*/}
          {/*<div className="text-gray-400 text-sm mt-1">{45}% to next rank</div>*/}
        </div>
      </div>
    </div>
  );
};
