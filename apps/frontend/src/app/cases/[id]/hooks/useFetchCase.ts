import { useQuery } from "@tanstack/react-query";
import { GET_CASES_URL } from "../../../types";
import { BaseCase } from "@solspin/game-engine-types";

export const useFetchCase = (name: string) => {
  return useQuery<BaseCase>({
    queryKey: ["case"],
    queryFn: async () => {
      const response = await fetch(`${GET_CASES_URL}/cases/${name}.json`, {
        cache: "force-cache",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }

      return await response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
