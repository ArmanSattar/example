import React, { useState, useEffect, useCallback } from "react";
import { server } from "typescript";

interface ProvablyFairProps {
  serverSeedHash: string;
  clientSeed: string;
  rollValue: number | null;
  serverSeed: string | null;
  onClientSeedChange: (newClientSeed: string) => void;
}

export const ProvablyFair: React.FC<ProvablyFairProps> = ({
  serverSeedHash,
  clientSeed,
  rollValue,
  serverSeed,
  onClientSeedChange
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [localClientSeed, setLocalClientSeed] = useState(clientSeed);

  useEffect(() => {
    setLocalClientSeed(clientSeed);
  }, [clientSeed]);

  const handleProvablyFairClick = () => {
    setIsPopupOpen(true);
  };

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    onClientSeedChange(localClientSeed);
  }, [localClientSeed, onClientSeedChange]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closePopup();
    }
  }, [closePopup]);

  useEffect(() => {
    if (isPopupOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPopupOpen, handleKeyPress]);

  const handleClientSeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalClientSeed(event.target.value);
  };

  return (
    <div className="w-full h-auto">
      <p className="inline-block text-white cursor-pointer px-2 py-1" onClick={handleProvablyFairClick}>
        Provably Fair
      </p>
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg shadow-lg w-11/12 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Provably Fair System</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Server Seed Hash</label>
              <input
                type="text"
                value={serverSeedHash}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Server Seed</label>
              <input
                type="text"
                value={
                  serverSeed !== null && typeof serverSeed === 'number'
                    ? serverSeed
                    : serverSeed || 'N/A'
                }
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Client Seed</label>
              <input
                type="text"
                value={localClientSeed}
                onChange={handleClientSeedChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Roll Value</label>
              <input
                type="text"
                value={
                  rollValue !== null && typeof rollValue === 'number'
                    ? rollValue
                    : rollValue || 'N/A'
                }
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed"
              />
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-white">How it works</h3>
              <p className="text-gray-300">
                Our provably fair system ensures that the outcome of each case opening is random and verifiable. 
                The server seed hash and client seed are combined to generate a unique outcome for each spin.
                The roll value represents the result of this combination, determining the item you receive.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Verify Your Results</h3>
              <p className="text-gray-300">
                You can use these seeds and the roll value to independently verify the fairness of your case openings. 
                Visit our verification page to learn more about the process and try it yourself.
              </p>
            </div>
            <button
              onClick={closePopup}
              className="mt-4 px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};