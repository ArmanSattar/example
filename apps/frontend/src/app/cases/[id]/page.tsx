"use client";

import { CaseItems } from "./components/CaseItems";
import React, { useEffect, useState } from "react";
import { Back } from "../../components/Back";
import { BaseCase } from "@solspin/game-engine-types";
import { useFetchCase } from "./hooks/useFetchCase";
import { toast } from "sonner";
import LoadingOverlay from "../../components/LoadingOverlay";
import { PreviousDrops } from "./components/PreviousDrops";
import { CarouselSection } from "./components/CarouselSection";
import Case from "../components/Case";

export default function CasePage({ params }: { params: { id: string } }) {
  const caseId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const { data: caseInfo, isLoading: isCaseInfoLoading, isError, error } = useFetchCase(caseId);
  const caseData = caseInfo as BaseCase;
  const [childComponentsLoaded, setChildComponentsLoaded] = useState({
    caseDetails: true,
  });

  useEffect(() => {
    if (!isCaseInfoLoading && !isError && Object.values(childComponentsLoaded).every(Boolean)) {
      setIsLoading(false);
    }
  }, [isCaseInfoLoading, isError, childComponentsLoaded]);

  if (isError || error) {
    toast.error(`Failed to fetch case data`);
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col justify-between gap-y-[8vh] py-2">
      <LoadingOverlay isLoading={isLoading} />
      {caseData && (
        <>
          <Back text="Back to Cases" to={""} />
          {/*<CaseDetails*/}
          {/*  {...caseData}*/}
          {/*  numberOfItems={caseData.items.length}*/}
          {/*  onLoaded={() => handleChildLoaded("caseDetails")}*/}
          {/*/>*/}
          <div className={"w-full flex justify-center items-center -mt-[6vh]"}>
            <Case {...caseData} disableClick={true} />
          </div>
          <CarouselSection caseData={caseData} />
          <CaseItems items={caseData.items} />
          <PreviousDrops />
        </>
      )}
    </div>
  );
}
