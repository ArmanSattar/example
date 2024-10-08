import { useQuery } from "@tanstack/react-query";
import { Wallet } from "@solspin/types";
import { useAuth } from "../../../context/AuthContext";

const BALANCE_ENDPOINT = process.env.NEXT_PUBLIC_WALLETS_API_URL;

if (!BALANCE_ENDPOINT) {
  throw new Error("Wallets API URL not provided");
}

export const useWalletInfo = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery<Wallet, Error>({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      const response = await fetch(`${BALANCE_ENDPOINT}/${userId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
  });
};
