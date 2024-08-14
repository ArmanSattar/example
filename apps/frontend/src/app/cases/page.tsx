"use client";

import React, { useEffect, useRef } from "react";
import { CasesHeader } from "./components/CasesHeader";
import { Cases } from "./components/Cases";
import { useCases } from "./hooks/useCases";
import { toast } from "sonner";
import { useLoading } from "../context/LoadingContext";

export default function CasesPage() {
  const { filteredCases, updateFilters, handleSearch, isLoading, isError, error, filters } =
    useCases();
  const { startLoading, finishLoading } = useLoading();
  const loadingFlag = useRef(false);

  useEffect(() => {
    if (isLoading && !loadingFlag.current) {
      startLoading();
      loadingFlag.current = true;
    }

    if (!isLoading && loadingFlag.current) {
      finishLoading();
    }
  }, [isLoading]);

  if (isError || error) {
    toast.error("Failed to fetch cases");
    return null;
  }

  return (
    <div className="w-full h-full flex-col justify-between items-center px-8">
      <CasesHeader updateFilters={updateFilters} handleSearch={handleSearch} filters={filters} />
      <Cases cases={filteredCases} isLoading={isLoading} />
      <div className="h-8 w-full"></div>
    </div>
  );
}
