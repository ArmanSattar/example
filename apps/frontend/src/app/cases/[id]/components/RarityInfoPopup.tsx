import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toggleRarityInfoPopup } from "../../../../store/slices/demoSlice";

const rarityData = [
  { name: "Consumer Grade", color: "bg-[#b0c3d9]", description: "Common items" },
  { name: "Industrial Grade", color: "bg-[#5e98d9]", description: "Slightly uncommon items" },
  { name: "Mil-Spec", color: "bg-[#4b69ff]", description: "Military specification grade items" },
  {
    name: "Restricted",
    color: "bg-[#8847ff]",
    description: "Rare items with limited availability",
  },
  { name: "Classified", color: "bg-[#d32ce6]", description: "Very rare items" },
  { name: "Covert", color: "bg-[#eb4b4b]", description: "Extremely rare, high-value items" },
  {
    name: "Extraordinary",
    color: "bg-[#ffd700]",
    description: "Exceptionally rare, special items",
  },
  { name: "Contraband", color: "bg-[#e4ae39]", description: "Unique, discontinued items" },
];

const RarityInfoPopup: React.FC = () => {
  const dispatch = useDispatch();
  const popupRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    dispatch(toggleRarityInfoPopup());
  }, [dispatch]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      console.log(popupRef.current, event.target);
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

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleKeyPress, handleClickOutside]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-background p-6 rounded-lg max-w-md w-full" ref={popupRef}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Case Item Rarities</h2>
          <button
            onClick={() => dispatch(toggleRarityInfoPopup())}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <ul>
          {rarityData.map((rarity) => (
            <li key={rarity.name} className="mb-2 flex items-center">
              <span className={`w-4 h-4 rounded-full mr-2 ${rarity.color}`}></span>
              <span className="font-semibold text-white">{rarity.name}:</span>
              <span className="ml-1 text-white opacity-80">{rarity.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RarityInfoPopup;
