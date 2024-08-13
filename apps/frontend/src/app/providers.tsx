"use client";
import { Provider } from "react-redux";
import { WebSocketProvider } from "./context/WebSocketContext";
import { WalletContextProvider } from "./context/WalletContextProvider";
import { AuthProvider } from "./context/AuthContext";
import store from "../store";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoadingProvider } from "./context/LoadingContext";
import { websocketUrl } from "./libs/constants";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <LoadingProvider>
        <WalletContextProvider>
          <WebSocketProvider url={websocketUrl}>
            <AuthProvider>
              <QueryClientProvider client={queryClient}>
                <Toaster
                  richColors
                  position="top-right"
                  expand={false}
                  duration={5000}
                  toastOptions={{
                    className: "toast-style",
                    closeButton: true,
                    descriptionClassName: "text-white",
                  }}
                />
                {children}
              </QueryClientProvider>
            </AuthProvider>
          </WebSocketProvider>
        </WalletContextProvider>
      </LoadingProvider>
    </Provider>
  );
}
