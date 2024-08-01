import {
  setNumCases,
  toggleDemoClicked,
  toggleFastClicked,
  togglePaidSpinClicked,
} from "../../../../store/slices/demoSlice";
import { addToBalance } from "../../../../store/slices/userSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { useAuth } from "../../../context/AuthContext";

interface CarouselButtonsSubSectionProps {
  price: number;
}

export const CarouselButtonsSubSection: React.FC<CarouselButtonsSubSectionProps> = ({ price }) => {
  const demoClicked = useSelector((state: RootState) => state.demo.demoClicked);
  const paidSpinClicked = useSelector((state: RootState) => state.demo.paidSpinClicked);
  const dispatch = useDispatch();
  const fastClicked = useSelector((state: RootState) => state.demo.fastClicked);
  const numCases = useSelector((state: RootState) => state.demo.numCases);
  const spinClicked = paidSpinClicked || demoClicked;
  const balance = useSelector((state: RootState) => state.user.balance);
  const chatOpen = useSelector((state: RootState) => state.chatBar.chatBarOpen);
  const { user } = useAuth();

  return (
    <div
      className={`flex flex-col ${
        chatOpen ? "md:flex-col" : "md:flex-row"
      } lg:flex-row space-y-4 md:space-y-0 md:gap-4 justify-start items-center w-max sm:items-start bg-navbar_bg p-2 rounded-md`}
    >
      <div className={`flex space-x-2 justify-start items-center w-full sm:w-max`}>
        {Array.from({ length: 4 }, (_, index) => (
          <button
            key={index}
            className={`bg- group hover:${
              spinClicked ? "" : "bg-gray-700"
            } rounded-md min-w-[48px] sm:flex-grow-0 flex-grow  h-12 p-2 ${
              index + 1 === numCases ? "bg-gray-700" : ""
            } ${
              spinClicked
                ? `opacity-50 cursor-not-allowed ${
                    index + 1 === numCases ? "" : "hover:bg-custom_gray"
                  }`
                : ""
            }`}
            onClick={() => !spinClicked && dispatch(setNumCases(index + 1))}
            disabled={spinClicked}
          >
            <span
              className={`text-gray-300 group-hover:text-white ${
                index + 1 === numCases ? "text-white" : ""
              }`}
            >
              {index + 1}
            </span>
          </button>
        ))}
      </div>
      <div className={`flex justify-center items-center gap-2 w-full sm:w-max`}>
        <button
          className={`flex flex-[2] sm:flex-grow-0 bg-green-500 rounded-md h-12 p-4 space-x-1 justify-center items-center ${
            spinClicked ? "opacity-50 cursor-not-allowed" : ""
          } ${true ? "" : "hidden"}`}
          onClick={() => {
            if (!spinClicked && balance >= price * numCases) {
              dispatch(togglePaidSpinClicked());
              dispatch(addToBalance(-price * numCases));
            }
          }}
          disabled={spinClicked}
        >
          <span className="text-white font-semibold whitespace-nowrap">
            Open {numCases} Case{numCases > 1 ? "s" : ""}
          </span>
          <span className="hidden sm:block text-white font-semibold text-sm">·</span>
          <span className="text-white font-semibold whitespace-nowrap">
            ${Math.round(price * numCases * 100) / 100}
          </span>
        </button>
        <button
          className={`flex flex-1 sm:flex-grow-0 justify-center items-center bg-custom_gray rounded-md h-12 p-3 ${
            spinClicked ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            if (!demoClicked) {
              dispatch(toggleDemoClicked());
            }
          }}
          disabled={spinClicked}
        >
          <span className="text-white">Demo</span>
        </button>
        <button
          className={`flex justify-center items-center bg-custom_gray rounded-md h-12 w-12 space-x-2 ${
            spinClicked ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            if (!spinClicked) {
              dispatch(toggleFastClicked());
            }
          }}
          disabled={spinClicked}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6.30275 15.962C6.52852 16.0525 6.79101 15.977 6.92288 15.7817L12.9228 6.84418C13.02 6.69953 13.0258 6.51687 12.9379 6.36765C12.85 6.21796 12.6821 6.12503 12.4999 6.12503H8.49559L9.98484 0.584117C10.0449 0.360273 9.92331 0.129086 9.69725 0.0379918C9.47265 -0.0526333 9.20849 0.0233355 9.07712 0.218336L3.07719 9.15584C2.98002 9.3005 2.97416 9.48315 3.06206 9.63237C3.14995 9.78206 3.31792 9.875 3.50005 9.875H7.50441L6.01516 15.4159C5.95509 15.6398 6.07666 15.8709 6.30275 15.962Z"
              fill={fastClicked ? "#22c55e" : "#ef4444"}
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
