import React from "react";
import { ITEM_HEIGHT } from "../../../libs/constants";

export const CaseCarouselSkeleton = () => {
  return (
    <div
      className={`relative rounded-md flex-grow w-full bg-navbar_bg border-2 border-color_stroke_1 shimmer min-h-[${
        ITEM_HEIGHT * 1.2
      }]`}
    ></div>
  );
};
