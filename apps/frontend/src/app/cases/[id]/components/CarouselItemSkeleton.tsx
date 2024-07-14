export const CarouselItemSkeleton = () => {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-full w-[192px] h-[192px] bg-gray-900 shimmer scale-90">
      <div className="relative flex justify-center items-center h-full w-full mt-10">
        <div className="w-4/5 h-[175px] bg-gray-800 rounded-2xl shimmer"></div>
      </div>
    </div>
  );
};
