"use client";

import { CaseDetails } from "./components/CaseDetails";
import { CaseItems } from "./components/CaseItems";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BaseCase } from "@solspin/game-engine-types";
import { useFetchCase } from "./hooks/useFetchCase";
import { toast } from "sonner";
import LoadingOverlay from "../../components/LoadingOverlay";
import { PreviousDrops } from "./components/PreviousDrops";
import { CarouselSection } from "./components/CarouselSection";
import { Back } from "../../components/Back";

export default function CasePage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const { data: caseInfo, isLoading: isCaseInfoLoading, isError, error } = useFetchCase(params.id);
  const caseData = useMemo(() => caseInfo as BaseCase, [caseInfo]);
  const [childComponentsLoaded, setChildComponentsLoaded] = useState({
    caseDetails: false,
  });

  const handleChildLoaded = useCallback((componentName: string) => {
    setChildComponentsLoaded((prev) => ({ ...prev, [componentName]: true }));
  }, []);

  useEffect(() => {
    if (!isCaseInfoLoading && !isError && Object.values(childComponentsLoaded).every(Boolean)) {
      setIsLoading(false);
    }
  }, [isCaseInfoLoading, isError, childComponentsLoaded]);

  if (isError || error) {
    toast.error(`Failed to fetch case data`);
    return (
      <div className={"w-full h-full flex justify-center items-center"}>
        <span className={"text-3xl text-center whitespace-nowrap"}>
          Oops! Something went wrong.
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-2 gap-y-[8vh]">
      <LoadingOverlay isLoading={isLoading} />
      {caseData && (
        <>
          <Back
            text="Back to Cases"
            to={""}
            customStyle={"absolute top-4 left-4 xl:hidden z-20 -mt-2"}
          />
          <CaseDetails
            {...caseData}
            numberOfItems={caseData.items.length}
            onLoaded={() => handleChildLoaded("caseDetails")}
          />
          <CarouselSection caseData={caseData} />
          <CaseItems items={caseData.items} />
          <PreviousDrops />
        </>
      )}
    </div>
  );
}
