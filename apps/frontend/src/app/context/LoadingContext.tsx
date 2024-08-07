import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  finishLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(1); // Start with 1 for initial loading

  const startLoading = useCallback(() => {
    console.log(loadingCount, "startLoading");
    setLoadingCount((prev) => prev + 1);
  }, []);

  const finishLoading = useCallback(() => {
    console.log(loadingCount, "finishLoading");
    setLoadingCount((prev) => Math.max(0, prev - 1));
  }, []);

  const isLoading = loadingCount > 0;

  // Simulate initial app loading
  useEffect(() => {
    const initialLoadTimeout = setTimeout(() => {
      finishLoading(); // This will set loadingCount to 0
    }, 250); // Adjust this time as needed

    return () => clearTimeout(initialLoadTimeout);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, finishLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
