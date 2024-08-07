import React from "react";
import { UserHeader } from "./components/UserHeader";
import UserInfoSection from "./components/UserProfile";
import { UserActions } from "./components/UserActions";

export default function Page() {
  const userProfileData = {
    username: "melz123",
    rank: "Unranked",
    progress: "40",
  };

  return (
    <div className="min-h-screen p-4 flex flex-col gap-y-[4vh]">
      <UserHeader {...userProfileData} />
      <UserActions />
      <UserInfoSection username={userProfileData.username} />
    </div>
  );
}
