import { useQuery } from "@tanstack/react-query";
import { GET_CASES_URL } from "../../types";
import { BaseCase } from "@solspin/game-engine-types";

export const useFetchCases = () => {
  return useQuery<BaseCase[]>({
    queryKey: ["cases"],
    queryFn: async () => {
      const response = await fetch(`${GET_CASES_URL}/cases.json`, {
        cache: "force-cache",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }
      return await response.json();
    },
    staleTime: 86400000, // 1 day
    gcTime: 86400000, // 1 day
    refetchInterval: 60000, // 1 minute
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
