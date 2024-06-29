"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.push("/cases");
    router.push("/profile")
  });

  return <div className="w-full h-full"></div>;
}
