"use client";

import React from "react";
import { useLoading } from "../context/LoadingContext";
import LoadingOverlay from "./LoadingOverlay";

export function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading();

  return (
    <>
      {isLoading && <LoadingOverlay />}
      {children}
    </>
  );
}
