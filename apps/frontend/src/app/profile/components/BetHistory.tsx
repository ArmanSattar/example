"use client";

import React, { useEffect, useRef } from "react";
import { useFetchBets } from "../hooks/useFetchBets";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";

const BetHistoryTable = () => {
  const { user } = useAuth();
  const { data: bets, isLoading, isError, error } = useFetchBets(user ? user.userId : "");
  const loadingFlag = useRef(false);
  const { startLoading, finishLoading } = useLoading();

  useEffect(() => {
    if (isLoading && !loadingFlag.current) {
      startLoading();
      loadingFlag.current = true;
    } else if (!isLoading && loadingFlag.current) {
      finishLoading();
      loadingFlag.current = false;
    }
  }, [isLoading]);

  if (!bets) {
    return null;
  }

  bets.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (bets.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-300 text-xl">No bets made</p>
      </div>
    );
  }

  return (
    <div className={"w-full flex flex-col justify-between gap-y-2"}>
      <span className={"uppercase text-lg font-bold text-white"}>Bet history</span>
      <div className="overflow-x-auto overflow-y-auto bg-color_gray_4 rounded-md shadow-lg p-4">
        <table className="min-w-full text-gray-300">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                Amount Won
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                Outcome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-500">
            {bets.map((bet) => (
              <tr key={bet.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{bet.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="flex items-center">
                    <span className="text-yellow-500 mr-1">◆</span>
                    {bet.amountBet.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="flex items-center">
                    <span className="text-yellow-500 mr-1">◆</span>
                    {bet.outcomeAmount.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{bet.gameType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span>{bet.outcome}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{bet.createdAt.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BetHistoryTable;
