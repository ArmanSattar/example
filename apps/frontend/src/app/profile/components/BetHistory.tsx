"use client";
import React from "react";
import { Bet } from "../../libs/types"

interface BetHistoryTableProps {
  bets: Bet[];
}

const BetHistoryTable: React.FC<BetHistoryTableProps> = ({ bets }) => {
  console.log(bets);

  if (bets.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-300 text-xl">No bets made</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-auto">
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
                <span>
                  {bet.outcome}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{bet.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BetHistoryTable;