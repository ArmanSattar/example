import {
  setNumCases,
  toggleDemoClicked,
  togglePaidSpinClicked,
} from "../../../../store/slices/demoSlice";
import { addToBalance } from "../../../../store/slices/userSlice";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { useAuth } from "../../../context/AuthContext";
import { Money } from "../../../components/Money";
import { FastButton } from "./FastButton";
import { toast } from "sonner";

interface CarouselButtonsSubSectionProps {
  price: number;
}

export const CarouselButtonsSubSection: React.FC<CarouselButtonsSubSectionProps> = ({ price }) => {
  const demoClicked = useSelector((state: RootState) => state.demo.demoClicked);
  const paidSpinClicked = useSelector((state: RootState) => state.demo.paidSpinClicked);
  const dispatch = useDispatch();
  const numCases = useSelector((state: RootState) => state.demo.numCases);
  const spinClicked = useMemo(() => paidSpinClicked || demoClicked, [paidSpinClicked, demoClicked]);
  const balance = useSelector((state: RootState) => state.user.balance);
  const { user } = useAuth();

  return (
    <div
      className={`flex flex-col w-full md:w-max md:flex-row space-y-4 md:space-y-0 md:gap-4 justify-start items-center sm:items-start bg-navbar_bg p-2 rounded-md`}
    >
      <div className={`flex space-x-2 justify-start items-center w-full md:w-max`}>
        {Array.from({ length: 4 }, (_, index) => (
          <button
            key={index}
            className={`group hover:${
              spinClicked ? "" : "bg-color_gray_3"
            } rounded-md min-w-[48px] flex-1 h-12 p-2 disabled:opacity-30 ${
              index + 1 === numCases ? "bg-color_gray_3" : ""
            } ${
              spinClicked
                ? `opacity-50 cursor-not-allowed ${
                    index + 1 === numCases ? "" : "hover:bg-color_gray_3"
                  }`
                : ""
            }`}
            onClick={() => !spinClicked && dispatch(setNumCases(index + 1))}
            disabled={spinClicked}
          >
            <span
              className={`text-gray-400 group-hover:text-white ${
                index + 1 === numCases ? "text-white" : ""
              }`}
            >
              {index + 1}
            </span>
          </button>
        ))}
        <FastButton customStyle={"flex md:hidden justify-center items-center"} />
      </div>
      <div className={`flex justify-center items-center gap-2 w-full md:w-max`}>
        <button
          className={`flex flex-[4] bg-green-500 rounded-md h-12 p-4 space-x-1 justify-center items-center action-btn-green ${
            spinClicked ? "opacity-50 cursor-not-allowed" : ""
          } ${user ? "" : "hidden"}`}
          onClick={() => {
            if (!spinClicked && balance / 100 >= price * numCases) {
              dispatch(togglePaidSpinClicked());
              dispatch(addToBalance(-price * numCases));
            } else if (!spinClicked) {
              toast.error("You do not have enough balance");
            }
          }}
          disabled={spinClicked}
        >
          <span className="text-white font-semibold whitespace-nowrap">
            Open {numCases} Case{numCases > 1 ? "s" : ""}
          </span>
          <span className="hidden sm:block text-white font-semibold text-sm">·</span>
          <Money
            amount={Math.round(price * numCases * 100) / 100}
            textStyle={"text-md font-semibold"}
            className={"space-x-1"}
          />
        </button>
        <button
          className={`flex flex-1 justify-center items-center action-btn-gray rounded-md h-12 p-3 ${
            spinClicked ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            if (!demoClicked) {
              dispatch(toggleDemoClicked());
            }
          }}
          disabled={spinClicked}
        >
          <span className="text-white font-semibold">Demo</span>
        </button>
        <FastButton customStyle={"hidden md:flex justify-center items-center"} />
      </div>
    </div>
  );
};
