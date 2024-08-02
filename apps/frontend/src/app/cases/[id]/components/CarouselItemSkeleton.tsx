import { ITEM_HEIGHT, ITEM_WIDTH } from "../utils";

export const CarouselItemSkeleton = () => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-full w-[${ITEM_WIDTH}px] h-[${ITEM_HEIGHT}px] bg-gray-900 shimmer scale-90`}
    >
      <div className="relative flex justify-center items-center h-full w-full mt-10">
        <div className="w-4/5 h-[175px] bg-gray-800 rounded-2xl shimmer"></div>
      </div>
    </div>
  );
};
