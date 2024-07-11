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
        <div className="w-full overflow-x-scroll [@media(min-width:1330px)]:overflow-x-visible main-element rounded-md p-4 [@media(min-width:1330px)]:bg-transparent [@media(min-width:1330px)]:shadow-none [@media(min-width:1330px)]:rounded-none [@media(min-width:1330px)]:p-0">
          <div className="flex justify-start space-x-5 lg:space-x-0 lg:gap-6 lg:grid-cols-3 [@media(min-width:1330px)]:grid [@media(min-width:1330px)]:w-full xl:grid-cols-4 2xl:grid-cols-5 lg:justify-center">
            {items.map((item, index) => (
              <CaseItem key={index} item={item} activeCase={activeCase} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
