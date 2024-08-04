"use client";
import FilterDropdownMenu from "./FilterDropdownMenu";
import { Search } from "./Search";
import React from "react";
import { IFilters } from "../../types";

interface CasesHeaderProps {
  updateFilters: (filterType: keyof IFilters, selectedOptions: string[]) => void;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CasesHeader: React.FC<CasesHeaderProps> = ({ updateFilters, handleSearch }) => {
  const dropdownItems = [
    {
      title: "Category",
      options: ["Hot", "New", "Special"],
      onSelect: (selectedOptions: string[]) => updateFilters("category", selectedOptions),
      type: "checkbox",
      width: "150px",
    },
    {
      title: "Rarity",
      options: ["Exceptional", "Exotic", "Rarity 3"],
      onSelect: (selectedOptions: string[]) => updateFilters("rarity", selectedOptions),
      type: "checkbox",
      width: "180px",
    },
    {
      title: "Order",
      options: [
        "Ascending price",
        "Descending price",
        "Popularity (Low to High)",
        "Popularity (High to Low)",
        "Newest",
        "Oldest",
      ],
      onSelect: (selectedOptions: string[]) => updateFilters("order", selectedOptions),
      type: "radio",
      width: "200px",
    },
    {
      title: "Price",
      options: ["Price 1", "Price 2", "Price 3"],
      onSelect: (selectedOptions: string[]) => updateFilters("price", selectedOptions),
      type: "radio",
      width: "100px",
    },
  ];

  return (
    <div className="w-full flex justify-between py-8 items-center">
      <div className="flex lg:max-xl:flex-col w-full justify-between items-center xl:items-end space-y-4 xl:space-x-2">
        <div className="hidden lg:flex space-x-4">
          {dropdownItems.map((item) => (
            <div key={item.title} className="flex flex-col space-y-0.5">
              <span className="text-2xs text-white ml-1.5">{item.title}</span>
              <FilterDropdownMenu
                key={item.title}
                title={item.title}
                options={item.options}
                onSelect={item.onSelect}
                type={item.type as "checkbox" | "radio"}
                width={item.width}
              />
            </div>
          ))}
        </div>
        <div
          className={
            "flex flex-col justify-center items-center xl:justify-end sm:flex-row space-y-2 sm:space-y-0 lg:space-y-2 sm:space-x-2 w-full"
          }
        >
          <button className="lg:hidden w-full sm:flex-1 h-10 bg-color_gray_3 text-white rounded text-xs font-semibold min-h-12">
            Filters
          </button>
          <div className="w-full lg:basis-auto lg:max-w-sm sm:flex-1 min-h-12 overflow-clip min-w-0">
            <Search handleSearch={handleSearch} />
          </div>
        </div>
      </div>
    </div>
  );
};
