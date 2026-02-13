import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

interface NetworkContextType {
  isConnected: boolean;
  isOnline: boolean;
  setNetworkStatus: (connected: boolean) => void;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isOnline: true,
  setNetworkStatus: () => {},
});

// Global reference for API interceptor to update network status
let networkStatusSetter: ((connected: boolean) => void) | null = null;

export const setGlobalNetworkStatus = (connected: boolean) => {
  if (networkStatusSetter) {
    networkStatusSetter(connected);
  }
};

export const useNetwork = () => useContext(NetworkContext);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkConnectivity = async () => {
    try {
      // Try to fetch a small resource to check connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
        cache: "no-cache",
      });

      clearTimeout(timeoutId);
      setIsConnected(true);
      setIsOnline(true);
    } catch (error) {
      setIsConnected(false);
      setIsOnline(false);
    }
  };

  const setNetworkStatus = (connected: boolean) => {
    setIsConnected(connected);
    setIsOnline(connected);
  };

  // Set global reference for API interceptor
  useEffect(() => {
    networkStatusSetter = setNetworkStatus;
    return () => {
      networkStatusSetter = null;
    };
  }, []);

  useEffect(() => {
    // Initial check
    checkConnectivity();

    // Check connectivity periodically
    const interval = setInterval(() => {
      checkConnectivity();
    }, 15000); // Check every 15 seconds

    // Check when app comes to foreground
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        checkConnectivity();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, isOnline, setNetworkStatus }}>
      {children}
    </NetworkContext.Provider>
  );
};
