"use client";

import React, { useEffect } from "react";
import { UserHeader } from "./components/UserHeader";
import { UserActions } from "./components/UserActions";
import { UserStats } from "./components/UserStats";
import BetHistory from "./components/BetHistory";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Page() {
  const { user, isLoading, updateUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/cases");
    }
  }, [isLoading, user, router]);

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
