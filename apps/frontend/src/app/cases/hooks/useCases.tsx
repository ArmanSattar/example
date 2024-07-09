"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { CaseItemRarity } from "../../types";

export interface ICase {
  id: string;
  name: string;
  price: number;
  rarity: string;
  tag: string;
  image: string;
  highestPrice: number;
  lowestPrice: number;
}

interface IFilters {
  category: string[];
  rarity: string[];
  order: string[];
  price: string[];
}

export const useCases = () => {
  const [filters, setFilters] = useState<IFilters>({
    category: [],
    rarity: [],
    order: [],
    price: [],
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const casesRef = useRef<ICase[]>();

  useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const response = await fetch("https://api.example.com/cases");
      return await response.json();
    },
  });

  if (!casesRef.current) {
    casesRef.current = Array.from({ length: 50 }, () => ({
      id: uuidv4(),
      name: Math.random() < 0.5 ? "Watson Power" : "Fire Hand Mystery",
      price: Math.round(Math.random() * 1000),
      rarity:
        Math.random() < 0.2
          ? CaseItemRarity.INDUSTRIAL_GRADE
          : Math.random() < 0.2
          ? CaseItemRarity.RESTRICTED
          : CaseItemRarity.COVERT,
      tag: Math.random() < 0.33 ? "Hot" : Math.random() < 0.66 ? "New" : "Special",
      image:
        Math.random() < 0.33
          ? "/cases/dota_3.svg"
          : Math.random() < 0.66
          ? "/cases/case-example-2.svg"
          : "/cases/case-examle-3.svg",
      highestPrice: 1000,
      lowestPrice: 0.01,
    }));
  }

  const filteredCases = useMemo(() => {
    if (!casesRef.current) return [];
    return casesRef.current.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filters.category.length === 0 || filters.category.includes(item.tag)) &&
        (filters.rarity.length === 0 || filters.rarity.includes(item.rarity)) &&
        (filters.price.length === 0 || filters.price.includes(item.price.toString()))
      );
    });
  }, [filters.category, filters.rarity, filters.price, searchTerm]);

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

  const updateFilters = useCallback((filterType: string, selectedOptions: string[]) => {
    setFilters((prevFilters: any) => ({
      ...prevFilters,
      [filterType]: selectedOptions,
    }));
  }, []);

  return { cases: sortedCases, updateFilters, handleSearch };
};
