import { useQuery } from "@tanstack/react-query";
import { betsUrl } from "../../libs/constants";
import { Bet } from "../../types";

export const useFetchBets = (id: string) => {
  return useQuery<Bet[]>({
    queryKey: ["bet_history"],
    queryFn: async () => {
      const response = await fetch(`${betsUrl}/user/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch bets");
      }

      return await response.json();
    },
    staleTime: 5000 * 60,
    gcTime: 5000 * 60,
  });
};
