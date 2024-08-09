"use client";

import React from "react";
import { UserHeader } from "./components/UserHeader";
import { UserActions } from "./components/UserActions";
import { UserStats } from "./components/UserStats";
import BetHistory from "./components/BetHistory";
import { useAuth } from "../context/AuthContext";

export default function Page() {
  const { user, updateUser } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col gap-y-[4vh] pb-4">
      <UserHeader user={user} updateUser={updateUser} />
      <UserActions user={user} updateUser={updateUser} />
      <UserStats user={user} />
      <BetHistory user={user} />
    </div>
  );
}
