"use client";

import React, { useEffect, useRef, useState } from "react";

interface FilterDropdownMenuProps {
  options: string[];
  onSelect: (options: string[]) => void;
  type: "checkbox" | "radio";
  width: string;
  height?: string;
  textSize?: string;
  defaultText?: string;
}

const FilterDropdownMenu: React.FC<FilterDropdownMenuProps> = ({
  options,
  onSelect,
  type,
  width,
  height,
  textSize,
  defaultText = "None",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: string) => {
    let newSelectedOptions: string[];
    if (type === "checkbox") {
      newSelectedOptions = selectedOptions.includes(option)
        ? selectedOptions.filter((item) => item !== option)
        : [...selectedOptions, option];
    } else {
      newSelectedOptions = [option];
    }
    setSelectedOptions(newSelectedOptions);
    onSelect(newSelectedOptions);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    if (defaultText !== "None") setSelectedOptions([defaultText]);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayText = selectedOptions.length > 0 ? selectedOptions.join(", ") : defaultText;

  const textSizeClass = textSize ? textSize : "text-xs";

  return (
    <div ref={dropdownRef} className="relative inline-block text-left" style={{ width }}>
      <div>
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          className={`inline-flex justify-between items-center w-full rounded-md ${
            height !== "" ? height : "h-10"
          } ${
            isOpen ? "rounded-b-none" : ""
          } bg-color_gray_3 px-4 py-2 text-sm font-medium text-white focus:outline-none transition-custom`}
          onClick={toggleDropdown}
        >
          <span className={`${textSizeClass} truncate`}>{displayText}</span>
          <svg
            className={`ml-2 h-5 w-5 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 w-full rounded-b-md shadow-lg bg-color_gray_3 z-50">
          <div className="" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {options.map((option) => (
              <label
                key={option}
                className={`flex items-center w-full p-2 h-10 ${textSizeClass} text-white bg-color_gray_3 hover:brightness-125 cursor-pointer last:rounded-b-md`}
              >
                <input
                  type={type}
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleOptionClick(option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdownMenu;
