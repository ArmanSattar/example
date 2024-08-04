import { CaseItem } from "./CaseItem";
import { BaseCaseItem } from "@solspin/game-engine-types";
import React from "react";

interface CaseItemsProps {
  items: BaseCaseItem[];
}

export const CaseItems: React.FC<CaseItemsProps> = React.memo(({ items }) => {
  return (
    <section className="flex flex-col space-y-5 items-start">
      <span className="text-white text-lg">Case Items</span>
      <div className="w-full overflow-x-auto lg:overflow-x-visible">
        <div className="inline-flex lg:grid lg:grid-cols-dynamic-2 lg:grid-flow-row-dense lg:w-full space-x-5 lg:space-x-0 lg:gap-3 justify-around">
          {items.map((item, index) => (
            <CaseItem key={index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
});

CaseItems.displayName = "CaseItems";
