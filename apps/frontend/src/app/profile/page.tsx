import React from "react";
import { UserHeader } from "./components/UserHeader";
import { UserActions } from "./components/UserActions";
import { UserStats } from "./components/UserStats";
import BetHistory from "./components/BetHistory";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col gap-y-[4vh]">
      <UserHeader />
      <UserActions />
      <UserStats />
      <BetHistory />
    </div>
  );
}
