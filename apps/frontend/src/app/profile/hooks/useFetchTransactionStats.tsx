import { useQuery } from "@tanstack/react-query";
import { betsUrl, walletsUrl } from "../../libs/constants";
import { WalletTransactionStats } from "@solspin/types";
import { BetStats } from "@solspin/events/src/service/betting/schemas";
import { UserStat } from "../../types";

export const useFetchTransactionStats = (id: string) => {
  return useQuery<UserStat[]>({
    queryKey: ["transaction-stats", id],
    queryFn: async () => {
      const [transactionsResponse, betStatsResponse] = await Promise.allSettled([
        fetch(`${walletsUrl}/${id}/transactions`),
        fetch(`${betsUrl}/stats/${id}`),
      ]);

      let transactions: WalletTransactionStats | null = null;
      let betStats: BetStats | null = null;

      if (transactionsResponse.status === "fulfilled" && transactionsResponse.value.ok) {
        transactions = await transactionsResponse.value.json();
      }

      if (betStatsResponse.status === "fulfilled" && betStatsResponse.value.ok) {
        betStats = await betStatsResponse.value.json();
      }

      if (!transactions && !betStats) {
        throw new Error("Failed to fetch both user betting stats and transactions");
      }

      const stats: UserStat[] = [];

      if (betStats) {
        stats.push(
          {
            title: "Total Bet",
            amount: betStats.totalBet,
          } as UserStat,
          {
            title: "Total Profit",
            amount: betStats.totalProfit,
          } as UserStat
        );
      }

      if (transactions) {
        stats.push({
          title: "Total Deposited",
          amount: transactions.amount,
        } as UserStat);
      }

      return stats;
    },
    staleTime: 5000 * 60,
    gcTime: 5000 * 60,
  });
};
