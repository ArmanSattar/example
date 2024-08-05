import { ITEM_HEIGHT, ITEM_WIDTH } from "../../../libs/constants";

export const CarouselItemSkeleton = () => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-full w-[${ITEM_WIDTH}px] h-[${ITEM_HEIGHT}px] bg-gray-900 shimmer scale-90`}
    ></div>
  );
};
