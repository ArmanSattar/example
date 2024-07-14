import React, { Suspense } from "react";
import { CaseSkeleton } from "./skeletons/CaseSkeleton";
import dynamic from "next/dynamic";
import { BaseCase } from "@solspin/game-engine-types";

const DynamicCase = dynamic(() => import("./Case"), {
  loading: () => <CaseSkeleton />,
});

interface CasesProps {
  cases: BaseCase[];
  isLoading: boolean;
}

export const Cases: React.FC<CasesProps> = ({ cases, isLoading }) => {
  if (isLoading || cases.length === 0) {
    return (
      <div className="grid grid-cols-dynamic gap-6 justify-center grid-flow-row-dense cases-container">
        <CaseSkeleton />
        <CaseSkeleton />
        <CaseSkeleton />
        <CaseSkeleton />
        <CaseSkeleton />
        <CaseSkeleton />
        <CaseSkeleton />
        <CaseSkeleton />
        <CaseSkeleton />
        <CaseSkeleton />
        <CaseSkeleton />
        <CaseSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-dynamic gap-6 justify-center grid-flow-row-dense cases-container">
      {cases.map((item, index) => (
        <Suspense key={index} fallback={<CaseSkeleton />}>
          <DynamicCase {...item} />
        </Suspense>
      ))}
    </div>
  );
};
