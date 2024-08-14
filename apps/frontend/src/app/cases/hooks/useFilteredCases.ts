import { useCallback, useMemo, useState } from "react";
import { BaseCase } from "@solspin/game-engine-types";
import { IFilters } from "../../types";

export const useFilteredCases = (cases: BaseCase[], isLoading: boolean) => {
  const [filters, setFilters] = useState<IFilters>({
    category: [],
    rarity: [],
    order: [],
    price: [],
    priceRange: [],
  });
  const [searchTerm, setSearchTerm] = useState<string>("");

  const searchTermInCases = useCallback(
    (lootbox: BaseCase) => {
      return (
        lootbox.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lootbox.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    },
    [searchTerm, cases]
  );

  const filteredCases = useMemo(() => {
    if (!cases) return [];
    const minPrice = filters.priceRange.length > 0 ? parseFloat(filters.priceRange[0]) : 0;
    const maxPrice = filters.priceRange.length > 0 ? parseFloat(filters.priceRange[1]) : Infinity;

    return cases.filter((item) => {
      const isPriceInRange = item.price >= minPrice && item.price <= maxPrice;

      return (
        searchTermInCases(item) &&
        (filters.category.length === 0 || filters.category.includes(item.tag)) &&
        (filters.rarity.length === 0 || filters.rarity.includes(item.rarity)) &&
        (filters.price.length === 0 || filters.price.includes(item.price.toString())) &&
        isPriceInRange
      );
    });
  }, [cases, filters.category, filters.rarity, filters.price, filters.priceRange, searchTerm]);

  const sortedCases = useMemo(() => {
    if (filters.order.length === 0) return filteredCases;

    return [...filteredCases].sort((a, b) => {
      switch (filters.order[0]) {
        case "Ascending price":
          return a.price - b.price;
        case "Descending price":
          return b.price - a.price;
        case "Popularity (High to Low)":
          return b.highestPrice - a.highestPrice;
        case "Popularity (Low to High)":
          return a.highestPrice - b.highestPrice;
        case "Newest":
          return a.name.localeCompare(b.name);
        case "Oldest":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [filteredCases, filters.order]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const updateFilters = useCallback((filterType: keyof IFilters, selectedOptions: string[]) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: selectedOptions,
    }));
  }, []);

  return { cases: sortedCases, updateFilters, handleSearch, filters };
};
