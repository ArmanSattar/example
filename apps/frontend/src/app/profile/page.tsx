import React from "react";
import { UserHeading } from "./components/UserHeading";
import UserInfoSection from "./components/UserProfile";

export default function Page() {
  const userProfileData = {
    username: "melz123",
    profilePictureURL: "/path/to/profile-picture.jpg",
    rank: "Unranked",
    progress: "40",
  };

  return (
    <div className="min-h-screen p-4">
      <UserHeading {...userProfileData} />
      <UserInfoSection username={userProfileData.username}/>
    </div>
  );
}
