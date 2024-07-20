import React from "react";
import { Tag } from "../../components/Tag";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { useAuth } from "../../../context/AuthContext";

interface CaseMetaDataProps {
  name: string;
  highestPrice: number;
  lowestPrice: number;
  totalItems: number;
  price: number;
  label: string;
}

export const CaseMetaData: React.FC<CaseMetaDataProps> = ({
  name,
  highestPrice,
  lowestPrice,
  totalItems,
  price,
  label,
}) => {
  const dispatch = useDispatch();
  const demoClicked = useSelector((state: RootState) => state.demo.demoClicked);
  const paidSpinClicked = useSelector((state: RootState) => state.demo.paidSpinClicked);
  const fastClicked = useSelector((state: RootState) => state.demo.fastClicked);
  const numCases = useSelector((state: RootState) => state.demo.numCases);
  const spinClicked = paidSpinClicked || demoClicked;
  const balance = useSelector((state: RootState) => state.user.balance);
  const chatOpen = useSelector((state: RootState) => state.chatBar.chatBarOpen);
  const { user } = useAuth();

  return (
    <div className="flex flex-col justify-between items-start w-3/5 space-y-4">
      <div className="flex gap-6 justify-between items-center mb-4">
        <span className="text-white font-bold text-3xl">{name}</span>
        {label !== "" && <Tag name={label} customStyle={"!text-lg !px-3"} />}
      </div>
      <div className={"w-full flex justify-center items-center"}>
        <div className={`flex justify-between items-center w-full`}>
          <div className="rounded-md py-3 px-4 bg-custom_gray space-x-1 2xl:space-x-3">
            <span className="text-white text-sm whitespace-nowrap xl:text-md-1 2xl:text-lg">
              Highest Item
            </span>
            <span className="text-white text-sm xl:text-lg">·</span>
            <span className="text-white text-sm whitespace-nowrap 2xl:text-lg">
              ${highestPrice}
            </span>
          </div>
          <div className="rounded-md py-3 px-4 bg-custom_gray space-x-1 2xl:space-x-3">
            <span className="text-white text-sm whitespace-nowrap 2xl:text-lg">Lowest Item</span>
            <span className="text-white text-sm xl:text-lg">·</span>
            <span className="text-white text-sm whitespace-nowrap 2xl:text-lg">${lowestPrice}</span>
          </div>
          <div className="rounded-md py-3 px-4 bg-custom_gray space-x-1 2xl:space-x-3">
            <span className="text-white text-sm whitespace-nowrap 2xl:text-lg">Total Items</span>
            <span className="text-white text-sm xl:text-lg">·</span>
            <span className="text-white text-sm whitespace-nowrap 2xl:text-lg">{totalItems}</span>
          </div>
        </div>
      </div>
      <div className={`w-full bg-custom_gray rounded-md flex justify-center items-center p-6`}>
        <p className="text-white font-light text-md xl:text-lg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </div>
    </div>
    // <div
    //   className={`flex flex-col ${
    //     chatOpen ? "lg:flex-col" : "lg:flex-row"
    //   } xl:flex-row space-y-4 md:space-y-0 md:gap-4 justify-start items-center sm:items-start w-full`}
    // >
    //   <div className={`flex space-x-2 justify-start items-center w-full sm:w-max`}>
    //     {Array.from({ length: 4 }, (_, index) => (
    //       <button
    //         key={index}
    //         className={`bg-custom_gray group hover:${
    //           spinClicked ? "" : "bg-gray-700"
    //         } rounded-md min-w-[48px] sm:flex-grow-0 flex-grow  h-12 p-2 ${
    //           index + 1 === numCases ? "bg-gray-700" : ""
    //         } ${
    //           spinClicked
    //             ? `opacity-50 cursor-not-allowed ${
    //                 index + 1 === numCases ? "" : "hover:bg-custom_gray"
    //               }`
    //             : ""
    //         }`}
    //         onClick={() => !spinClicked && dispatch(setNumCases(index + 1))}
    //         disabled={spinClicked}
    //       >
    //         <span
    //           className={`text-gray-300 group-hover:text-white ${
    //             index + 1 === numCases ? "text-white" : ""
    //           }`}
    //         >
    //           {index + 1}
    //         </span>
    //       </button>
    //     ))}
    //   </div>
    //   <div className={`flex justify-center items-center gap-2 w-full sm:w-max`}>
    //     <button
    //       className={`flex flex-[2] sm:flex-grow-0 bg-green-500 rounded-md h-12 p-4 space-x-1 justify-center items-center ${
    //         spinClicked ? "opacity-50 cursor-not-allowed" : ""
    //       } ${user ? "" : "hidden"}`}
    //       onClick={() => {
    //         if (!spinClicked && balance >= price * numCases) {
    //           dispatch(togglePaidSpinClicked());
    //           dispatch(addToBalance(-price * numCases));
    //         }
    //       }}
    //       disabled={spinClicked}
    //     >
    //       <span className="text-white font-semibold whitespace-nowrap">
    //         Open {numCases} Case{numCases > 1 ? "s" : ""}
    //       </span>
    //       <span className="hidden sm:block text-white font-semibold text-sm">·</span>
    //       <span className="text-white font-semibold whitespace-nowrap">
    //         ${Math.round(price * numCases * 100) / 100}
    //       </span>
    //     </button>
    //     <button
    //       className={`flex flex-1 sm:flex-grow-0 justify-center items-center bg-custom_gray rounded-md h-12 p-3 ${
    //         spinClicked ? "opacity-50 cursor-not-allowed" : ""
    //       }`}
    //       onClick={() => {
    //         if (!demoClicked) {
    //           dispatch(toggleDemoClicked());
    //         }
    //       }}
    //       disabled={spinClicked}
    //     >
    //       <span className="text-white">Demo</span>
    //     </button>
    //     <button
    //       className={`flex flex-1 sm:flex-grow-0 justify-center items-center bg-custom_gray rounded-md h-12 p-3 space-x-2 ${
    //         spinClicked ? "opacity-50 cursor-not-allowed" : ""
    //       }`}
    //       onClick={() => {
    //         if (!spinClicked) {
    //           dispatch(toggleFastClicked());
    //         }
    //       }}
    //       disabled={spinClicked}
    //     >
    //       <div
    //         className={`rounded-full w-2 h-2 ${fastClicked ? "bg-green-500" : "bg-red-700"}`}
    //       ></div>
    //       <span className="text-white">Quick</span>
    //     </button>
    //   </div>
    // </div>
    // </div>
  );
};
