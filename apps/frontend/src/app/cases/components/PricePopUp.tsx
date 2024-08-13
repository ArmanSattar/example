import React, { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import Close from "../../../../public/icons/close.svg";
import { IFilters } from "../../types";

interface PricePopUpProps {
  handleClose: () => void;
  updateFilters: (filterType: keyof IFilters, selectedOptions: string[]) => void;
  priceRangeCallback: (priceRange: [string, string]) => void;
}

export const PricePopUp: React.FC<PricePopUpProps> = ({
  handleClose,
  updateFilters,
  priceRangeCallback,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [lowerBoundValue, setLowerBoundValue] = React.useState<string>("");
  const [upperBoundValue, setUpperBoundValue] = React.useState<string>("");

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        // Check if the click is on a toast or within a toast
        const isToastClick = (event.target as Element).closest("[data-sonner-toast]") !== null;

        if (!isToastClick) {
          handleClose();
        }
      }
    },
    [handleClose]
  );

  const handleLowerBound = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setLowerBoundValue(value);
    }
  };

  const handleUpperBound = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setUpperBoundValue(value);
    }
  };

  const handlePriceRangeApply = useCallback(() => {
    if (
      lowerBoundValue === "" ||
      upperBoundValue === "" ||
      parseFloat(lowerBoundValue) >= parseFloat(upperBoundValue) ||
      parseFloat(lowerBoundValue) < 0 ||
      parseFloat(upperBoundValue) < 0
    ) {
      toast.error("Please enter a valid price range");
      return;
    }

    updateFilters("priceRange", [lowerBoundValue, upperBoundValue]);
    priceRangeCallback([lowerBoundValue, upperBoundValue]);
    handleClose();
  }, [lowerBoundValue, updateFilters, upperBoundValue]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleKeyPress, handleClickOutside]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={popupRef}
        className="bg-color_gray_4 py-6 px-8 rounded-lg border-4 border-color_stroke_1 shadow-lg w-11/12 md:w-1/2 xl:w-1/3 h-auto max-w-4xl transform translate-y-0 flex flex-col items-center justify-between relative gap-y-[2vh]"
      >
        <Close
          onClick={handleClose}
          className="absolute top-7 right-7 text-white cursor-pointer hover:opacity-90 w-6 h-6"
        />
        <span className={"text-white text-2xl font-semibold"}>Set Price Range</span>
        <fieldset className="relative rounded-sm border-2 border-color_stroke_1 bg-color_gray_3 py-2 p-4 flex space-x-2 h-16 w-2/3 items-center justify-center focus-within:border-color_secondary transition-colors">
          <legend className="text-white text-sm ml-2">Minimum</legend>
          <input
            className="w-full placeholder:transition-opacity placeholder:font-light placeholder-gray-400 focus:placeholder:opacity-50 bg-transparent text-white focus:outline-none text-left"
            type="text"
            placeholder="0"
            value={lowerBoundValue}
            onChange={(e) => handleLowerBound(e)}
          />
        </fieldset>
        <fieldset className="relative rounded-sm border-2 border-color_stroke_1 bg-color_gray_3 py-2 p-4 flex space-x-2 h-16 w-2/3 items-center justify-center focus-within:border-color_secondary transition-colors">
          <legend className="text-white text-sm ml-2">Maximum</legend>
          <input
            className="w-full placeholder:transition-opacity placeholder:font-light placeholder-gray-400 focus:placeholder:opacity-50 bg-transparent text-white focus:outline-none text-left"
            type="text"
            placeholder="100"
            value={upperBoundValue}
            onChange={(e) => handleUpperBound(e)}
          />
        </fieldset>
        <button
          className={
            "w-1/3 h-12 bg-green-500 action-btn-green text-white rounded text-sm font-semibold"
          }
          onClick={handlePriceRangeApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
};
