import { CaseItem } from "./CaseItem";
import { BaseCase, BaseCaseItem } from "@solspin/game-engine-types";

interface CaseItemsProps {
  items: BaseCaseItem[];
  activeCase: BaseCase;
}

export const CaseItems: React.FC<CaseItemsProps> = ({ items, activeCase }) => {
  return (
    <>
      <section className="flex flex-col space-y-5 items-start">
        <h2 className="text-white text-lg">Case Items</h2>
        <div className="w-full overflow-x-auto lg:overflow-x-visible main-element rounded-md lg:bg-transparent lg:shadow-none lg:rounded-none p-4 lg:p-0">
          <div className="inline-flex lg:grid lg:grid-cols-dynamic-2 lg:grid-flow-row-dense lg:w-full space-x-5 lg:space-x-0 lg:gap-3 pr-5 lg:pr-0">
            {items.map((item, index) => (
              <CaseItem key={index} item={item} activeCase={activeCase} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
