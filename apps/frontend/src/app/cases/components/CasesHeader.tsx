"use client";
import FilterDropdownMenu from "./FilterDropdownMenu";
import { Search } from "./Search";
import React, { useMemo } from "react";
import { IFilters } from "../../types";
import { PricePopUp } from "./PricePopUp";
import Image from "next/image";

interface CasesHeaderProps {
  updateFilters: (filterType: keyof IFilters, selectedOptions: string[]) => void;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters: IFilters;
}

type FilterKey = keyof IFilters;

export const CasesHeader: React.FC<CasesHeaderProps> = ({
  updateFilters,
  handleSearch,
  filters,
}) => {
  const [filtersExpand, setFiltersExpand] = React.useState(false);
  const [isPricePopUpOpen, setIsPricePopUpOpen] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState({ min: "", max: "" });

  const dropdownItems = useMemo(
    () => [
      {
        title: "Category",
        options: ["Hot", "New", "Special"],
        onSelect: (selectedOptions: string[]) => updateFilters("category", selectedOptions),
        type: "checkbox",
        width: "150px",
      },
      {
        title: "Rarity",
        options: [
          "Consumer Grade",
          "Industrial Grade",
          "Mil-Spec",
          "Restricted",
          "Classified",
          "Covert",
          "Extraordinary",
          "Contraband",
        ],
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
    ],
    [updateFilters]
  );

  return (
    <div className="w-full flex justify-between py-8 items-center">
      <div className="flex lg:max-xl:flex-col w-full justify-between items-center xl:items-end space-y-4 xl:space-x-2">
        <div className="hidden lg:flex space-x-4">
          {dropdownItems.map((item) => (
            <div key={item.title} className="flex flex-col space-y-0.5">
              <span className="text-2xs text-white ml-1.5">{item.title}</span>
              <FilterDropdownMenu
                key={item.title}
                options={item.options}
                onSelect={item.onSelect}
                type={item.type as "checkbox" | "radio"}
                width={item.width}
                height={"h-10"}
                currentFilter={filters[item.title.toLowerCase() as FilterKey] as string[]}
              />
            </div>
          ))}
          <div className="flex flex-col space-y-0.5">
            <label className="text-2xs text-white ml-1.5">Price</label>
            <button
              className={`inline-flex justify-between items-center w-full rounded-md h-10
               bg-color_gray_3 py-2 px-3 text-sm font-medium text-white focus:outline-none transition-custom gap-x-2`}
              onClick={() => setIsPricePopUpOpen(!isPricePopUpOpen)}
            >
              <div className={"w-7 h-7 relative"}>
                <Image src={"/icons/gold_coin.png"} alt={"Gold coin"} width={32} height={32} />
              </div>
              {priceRange.min === "" || priceRange.max === "" ? (
                <span className={"text-white whitespace-nowrap font-semibold"}>All</span>
              ) : (
                <span className={"text-white whitespace-nowrap font-semibold font-mono"}>
                  {priceRange.min} to {priceRange.max}
                </span>
              )}
            </button>
          </div>
        </div>
        <div
          className={
            "flex flex-col justify-center items-center xl:justify-end sm:flex-row space-y-2 sm:space-y-0 lg:space-y-2 sm:space-x-2 w-full"
          }
        >
          <button
            className="lg:hidden w-full sm:flex-1 h-10 bg-color_gray_4 text-white rounded text-xs font-semibold min-h-12 shadow-lg"
            onClick={() => {
              setFiltersExpand(!filtersExpand);
            }}
          >
            Filters
          </button>
          {filtersExpand && (
            <div className="flex flex-col lg:hidden space-y-4 justify-between w-full items-center rounded-lg -mt-5 bg-black/[0.3] p-4">
              {dropdownItems.map((item) => (
                <div key={item.title} className="flex w-full flex-col space-y-0.5">
                  <label className="text-2xs text-white ml-1.5">{item.title}</label>
                  <FilterDropdownMenu
                    key={item.title}
                    options={item.options}
                    onSelect={item.onSelect}
                    type={item.type as "checkbox" | "radio"}
                    width={"100%"}
                    currentFilter={filters[item.title.toLowerCase() as FilterKey] as string[]}
                  />
                </div>
              ))}
              <div className="flex flex-col space-y-0.5">
                <label className="text-2xs text-white ml-1.5">Price</label>
                <button
                  className={`inline-flex justify-between items-center w-full rounded-md h-10
               bg-color_gray_3 py-2 px-3 text-sm font-medium text-white focus:outline-none transition-custom gap-x-3`}
                  onClick={() => setIsPricePopUpOpen(!isPricePopUpOpen)}
                >
                  <div className={"w-7 h-7 relative"}>
                    <Image src={"/icons/gold_coin.png"} alt={"Gold coin"} width={32} height={32} />
                  </div>
                  {filters.priceRange.length === 0 ? (
                    <span className={"text-white whitespace-nowrap font-semibold"}>All</span>
                  ) : (
                    <span className={"text-white whitespace-nowrap font-semibold font-mono"}>
                      {filters.priceRange[0]} to {filters.priceRange[1]}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
          <div className="w-full lg:basis-auto lg:max-w-sm sm:flex-1 min-h-12 overflow-clip min-w-0 shadow-lg">
            <Search handleSearch={handleSearch} />
          </div>
        </div>
      </div>
      {isPricePopUpOpen && (
        <PricePopUp
          handleClose={() => setIsPricePopUpOpen(false)}
          updateFilters={updateFilters}
          priceRangeCallback={(priceRange: [string, string]) => {
            setPriceRange({ min: priceRange[0], max: priceRange[1] });
          }}
          currentFilter={filters.priceRange}
        />
      )}
    </div>
  );
};
