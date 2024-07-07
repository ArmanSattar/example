import { CaseItem } from "./CaseItem";
import { ICaseItem } from "../page";

interface CaseItemsProps {
  items: ICaseItem[];
}

export const CaseItems: React.FC<CaseItemsProps> = ({ items }) => {
  return (
    <div className="flex flex-col space-y-5 pb-4">
      <span className="text-white text-lg">Case Items</span>
      <div className="flex lg:grid overflow-x-auto lg:overflow-x-visible space-x-5 lg:space-x-0 lg:gap-6 lg:grid-cols-3 xl:grid-cols-4 lg:justify-center">
        {items.map((item, index) => (
          <CaseItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
};
