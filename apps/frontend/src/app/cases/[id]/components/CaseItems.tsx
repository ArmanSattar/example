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
        <div className="w-full overflow-x-auto [@media(min-width:1330px)]:overflow-x-visible main-element rounded-md p-4 [@media(min-width:1330px)]:bg-transparent [@media(min-width:1330px)]:shadow-none [@media(min-width:1330px)]:rounded-none [@media(min-width:100)]:p-0">
          <div className="inline-flex lg:grid lg:w-full lg:grid-cols-3 xl:grid-cols-4 [@media(min-width:1700px)]:grid-cols-5 space-x-5 lg:space-x-0 lg:gap-6 pr-5 lg:pr-0">
            {items.map((item, index) => (
              <CaseItem key={index} item={item} activeCase={activeCase} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
