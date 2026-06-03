import { createContext, ReactNode, useContext, useState } from "react";
import LoadingPage from "../components/LoadingPage";
import { LoadingContextType } from "../types/globals";

const LoadingContext = createContext<LoadingContextType>({
  startLoading: () => {
    console.warn("startLoading called outside of LoadingProvider");
  },
  stopLoading: () => {
    console.warn("stopLoading called outside of LoadingProvider");
  },
});

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loadingCount, setLoadingCount] = useState<number>(0);

  const startLoading = () => {
    setLoadingCount(prev => prev + 1);
  };

  const stopLoading = () => {
    setLoadingCount(prev => Math.max(0, prev - 1));
  };

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading }}>
        {children}
        {loadingCount > 0 && <LoadingPage /> }
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
