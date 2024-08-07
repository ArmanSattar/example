import React from "react";
import { UserHeader } from "./components/UserHeader";
import UserInfoSection from "./components/UserProfile";

export default function Page() {
  const userProfileData = {
    username: "melz123",
    rank: "Unranked",
    progress: "40",
  };

  return (
    <div className="min-h-screen p-4">
      <UserHeader {...userProfileData} />
      <UserInfoSection username={userProfileData.username} />
    </div>
  );
}
