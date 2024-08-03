"use client";

import { useDispatch, useSelector } from "react-redux";
import { toggleFastClicked } from "../../../../store/slices/demoSlice";
import React from "react";
import { RootState } from "../../../../store";
import { cn } from "../utils";

interface FastButtonProps {
  customStyle: string;
}

export const FastButton: React.FC<FastButtonProps> = ({ customStyle }) => {
  const fastClicked = useSelector((state: RootState) => state.demo.fastClicked);
  const spinClicked = useSelector(
    (state: RootState) => state.demo.demoClicked || state.demo.paidSpinClicked
  );
  const dispatch = useDispatch();

  return (
    <button
      className={cn(
        `rounded-md hover:bg-color_gray_3 h-12 w-12 space-x-2 ${
          spinClicked ? "opacity-50 cursor-not-allowed" : ""
        }`,
        customStyle
      )}
      onClick={() => {
        if (!spinClicked) {
          dispatch(toggleFastClicked());
        }
      }}
      disabled={spinClicked}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M6.30275 15.962C6.52852 16.0525 6.79101 15.977 6.92288 15.7817L12.9228 6.84418C13.02 6.69953 13.0258 6.51687 12.9379 6.36765C12.85 6.21796 12.6821 6.12503 12.4999 6.12503H8.49559L9.98484 0.584117C10.0449 0.360273 9.92331 0.129086 9.69725 0.0379918C9.47265 -0.0526333 9.20849 0.0233355 9.07712 0.218336L3.07719 9.15584C2.98002 9.3005 2.97416 9.48315 3.06206 9.63237C3.14995 9.78206 3.31792 9.875 3.50005 9.875H7.50441L6.01516 15.4159C5.95509 15.6398 6.07666 15.8709 6.30275 15.962Z"
          fill={fastClicked ? "#22c55e" : "#ef4444"}
        />
      </svg>
    </button>
  );
};
