import Image from "next/image";
import { ICaseItem } from "../page";

interface CaseItemProps {
  item: ICaseItem;
}

export const CaseItem: React.FC<CaseItemProps> = ({ item }) => {
  return (
    <div className="flex items-center rounded-sm space-x-2 p-4 main-element overflow-hidden min-w-[240px] h-40">
      <div
        className="relative flex flex-col items-center justify-center bg-gray-900 border-black border-[1px] rounded-lg"
        style={{ width: 125, height: 125 }}
      >
        <div className="relative flex justify-center items-center h-full w-full">
          <Image src={item.imagePath} alt={"case"} width={125} height={125} />
        </div>
        <div
          className={`absolute bottom-0 right-0 w-full h-1/3 opacity-20 case-${item.rarity
            .toLowerCase()
            .replace(" ", "-")}-gradient`}
        ></div>
        <div
          className={`absolute bottom-2 w-3/4 h-0.5 case-${item.rarity
            .toLowerCase()
            .replace(" ", "-")}-beam`}
        ></div>
      </div>
      <div className="flex flex-col justify-center items-start space-y-1">
        <span className="text-white text-sm">Watson Power</span>
        <span className="text-white text-sm">Exceptional</span>
        <span className="text-white text-sm">$4.99</span>
        <div className="rounded-md bg-dark p-1">
          <span className="text-white text-xs">{Math.round(item.chance * 10000) / 100}%</span>
        </div>
      </div>
    </div>
  );
};
