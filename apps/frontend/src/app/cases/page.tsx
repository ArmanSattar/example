"use client";

import React from "react";
import { CasesHeader } from "./components/CasesHeader";
import { Cases } from "./components/Cases";
import { useCases } from "./hooks/useCases";
import { toast } from "sonner";

export default function CasesPage() {
  const { filteredCases, updateFilters, handleSearch, isLoading, isError, error } = useCases();

  if (isError || error) {
    toast.error("Failed to fetch cases");
    return null;
  }

  return (
    <div className="w-full h-full flex-col justify-between items-center px-8">
      <CasesHeader updateFilters={updateFilters} handleSearch={handleSearch} />
      <Cases cases={filteredCases} isLoading={isLoading} />
      <div className="h-8 w-full"></div>
    </div>
  );
}
