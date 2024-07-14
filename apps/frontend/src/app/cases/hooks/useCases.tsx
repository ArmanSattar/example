import { useFetchCases } from "./useFetchCases";
import { useFilteredCases } from "./useFilteredCases";
import { BaseCase } from "@solspin/game-engine-types";

export const useCases = () => {
  const { data: fetchedCases, isLoading, isError, error } = useFetchCases();
  const {
    cases: filteredCases,
    updateFilters,
    handleSearch,
  } = useFilteredCases(fetchedCases as BaseCase[], isLoading);
  return { filteredCases, updateFilters, handleSearch, isLoading, isError, error };
};
