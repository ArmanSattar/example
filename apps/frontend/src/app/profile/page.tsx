import React from "react";
import { UserHeader } from "./components/UserHeader";
import UserInfoSection from "./components/UserProfile";
import { UserActions } from "./components/UserActions";

export default function Page() {
  return (
    <div className="min-h-screen p-4 flex flex-col gap-y-[4vh]">
      <UserHeader />
      <UserActions />
      <UserInfoSection />
    </div>
  );
}
