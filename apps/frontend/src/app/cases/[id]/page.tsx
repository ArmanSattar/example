"use client";

import { CaseDetails } from "./components/CaseDetails";
import { CaseItems } from "./components/CaseItems";
import React, { useEffect, useMemo, useRef } from "react";
import { BaseCase } from "@solspin/game-engine-types";
import { useFetchCase } from "./hooks/useFetchCase";
import { toast } from "sonner";
import { CarouselSection } from "./components/CarouselSection";
import { Back } from "../../components/Back";
import { useLoading } from "../../context/LoadingContext";

export default function CasePage({ params }: { params: { id: string } }) {
  const { data: caseInfo, isLoading, isError, error } = useFetchCase(params.id);
  const caseData = useMemo(() => caseInfo as BaseCase, [caseInfo]);
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
    toast.error(`Failed to fetch case data`);
    return (
      <div className={"w-full h-full flex flex-col gap-y-[5vh] justify-center items-center"}>
        <span className={"text-8xl text-center text-white whitespace-nowrap"}>Oops!</span>
        <span className={"text-6xl text-center text-white whitespace-nowrap"}>
          Something went wrong.
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-2 gap-y-[8vh]">
      {caseData && (
        <>
          <Back
            text="Back to Cases"
            to={""}
            customStyle={"absolute top-4 left-4 xl:hidden z-20 -mt-2"}
          />
          <div className={"flex flex-col justify-center items-center gap-y-[4vh] sm:gap-0"}>
            <CaseDetails {...caseData} numberOfItems={caseData.items.length} />
            <CarouselSection caseData={caseData} />
          </div>
          <CaseItems items={caseData.items} />
        </>
      )}
    </div>
  );
}
